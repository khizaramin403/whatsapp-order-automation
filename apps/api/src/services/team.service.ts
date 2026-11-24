import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import {
  teamRepository,
  TeamRepository,
  UpdateTeamMemberInput,
} from "../repositories/team.repository";
import { AppError } from "../utils/errors";
import { AccessTokenPayload } from "./auth.service";
import { parsePagination, buildPaginationMeta, PaginationMeta } from "../utils/pagination";

export interface CreateTeamMemberServiceInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  language?: string;
}

export class TeamService {
  constructor(private readonly teamRepo: TeamRepository = teamRepository) {}

  private getEffectiveRestaurantId(user: AccessTokenPayload): string {
    if (!user.restaurantId) {
      throw AppError.forbidden("No restaurant associated with this user account");
    }
    return user.restaurantId;
  }

  private assertOwner(user: AccessTokenPayload): void {
    if (user.role !== Role.owner && user.role !== Role.super_admin) {
      throw AppError.forbidden("Only the hotel owner can manage team members");
    }
  }

  async getTeamMembers(
    currentUser: AccessTokenPayload,
    query: { search?: string; role?: Role; page?: unknown; pageSize?: unknown }
  ): Promise<{ team: unknown[]; meta: PaginationMeta }> {
    this.assertOwner(currentUser);
    const restaurantId = this.getEffectiveRestaurantId(currentUser);

    const { page, pageSize, skip, take } = parsePagination({
      page: query.page,
      pageSize: query.pageSize || 20,
    });

    const [team, total] = await this.teamRepo.findMany(restaurantId, {
      search: query.search,
      role: query.role,
      skip,
      take,
    });

    const meta = buildPaginationMeta(page, pageSize, total);
    return { team, meta };
  }

  async getTeamMemberById(currentUser: AccessTokenPayload, userId: string) {
    this.assertOwner(currentUser);
    const restaurantId = this.getEffectiveRestaurantId(currentUser);

    const member = await this.teamRepo.findById(restaurantId, userId);
    if (!member) {
      throw AppError.notFound("Team member not found");
    }
    return member;
  }

  async createTeamMember(currentUser: AccessTokenPayload, input: CreateTeamMemberServiceInput) {
    this.assertOwner(currentUser);
    const restaurantId = this.getEffectiveRestaurantId(currentUser);

    // Allowed staff roles for creation: manager, chef, rider
    if (input.role !== Role.manager && input.role !== Role.chef && input.role !== Role.rider) {
      throw AppError.badRequest("Role must be manager, chef, or rider");
    }

    // Check email uniqueness
    const existingEmail = await this.teamRepo.findByEmail(input.email);
    if (existingEmail) {
      throw AppError.badRequest("A user with this email address already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    return this.teamRepo.create(restaurantId, {
      name: input.name,
      email: input.email,
      password_hash: passwordHash,
      role: input.role,
      language: input.language || "en",
    });
  }

  async updateTeamMember(
    currentUser: AccessTokenPayload,
    targetUserId: string,
    input: UpdateTeamMemberInput
  ) {
    this.assertOwner(currentUser);
    const restaurantId = this.getEffectiveRestaurantId(currentUser);

    // Rule: Nobody can change their own role or deactivate themselves
    if (currentUser.userId === targetUserId) {
      if (input.role !== undefined && input.role !== currentUser.role) {
        throw AppError.forbidden("You cannot change your own role");
      }
      if (input.is_active === false) {
        throw AppError.forbidden("You cannot deactivate your own account");
      }
    }

    if (input.role && input.role !== Role.manager && input.role !== Role.chef && input.role !== Role.rider && input.role !== Role.owner) {
      throw AppError.badRequest("Invalid role assignment");
    }

    if (input.email) {
      const existing = await this.teamRepo.findByEmail(input.email);
      if (existing && existing.id !== targetUserId) {
        throw AppError.badRequest("Email already in use by another user");
      }
    }

    return this.teamRepo.update(restaurantId, targetUserId, input);
  }

  async deactivateTeamMember(currentUser: AccessTokenPayload, targetUserId: string) {
    this.assertOwner(currentUser);
    const restaurantId = this.getEffectiveRestaurantId(currentUser);

    // Rule: Nobody can deactivate themselves
    if (currentUser.userId === targetUserId) {
      throw AppError.forbidden("You cannot deactivate your own account");
    }

    return this.teamRepo.deactivate(restaurantId, targetUserId);
  }
}

export const teamService = new TeamService();
