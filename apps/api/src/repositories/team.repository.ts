import { prisma } from "../config/prisma";
import { Prisma, Role } from "@prisma/client";
import { AppError } from "../utils/errors";

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  language?: string;
}

export interface UpdateTeamMemberInput {
  name?: string;
  email?: string;
  role?: Role;
  language?: string;
  is_active?: boolean;
}

export class TeamRepository {
  private assertRestaurantId(restaurantId: string): void {
    if (!restaurantId || typeof restaurantId !== "string" || restaurantId.trim() === "") {
      throw AppError.forbidden("Tenant restaurant ID is required for team operations");
    }
  }

  async findMany(
    restaurantId: string,
    options: {
      search?: string;
      role?: Role;
      skip: number;
      take: number;
    }
  ) {
    this.assertRestaurantId(restaurantId);

    const where: Prisma.UserWhereInput = {
      restaurant_id: restaurantId,
    };

    if (options.role) {
      where.role = options.role;
    }

    if (options.search && options.search.trim()) {
      const term = options.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          restaurant_id: true,
          name: true,
          email: true,
          role: true,
          language: true,
          avatar_key: true,
          is_active: true,
          created_at: true,
          updated_at: true,
        },
        orderBy: [{ is_active: "desc" }, { created_at: "desc" }],
        skip: options.skip,
        take: options.take,
      }),
      prisma.user.count({ where }),
    ]);

    return [users, total] as const;
  }

  async findById(restaurantId: string, userId: string) {
    this.assertRestaurantId(restaurantId);

    return prisma.user.findFirst({
      where: {
        id: userId,
        restaurant_id: restaurantId,
      },
      select: {
        id: true,
        restaurant_id: true,
        name: true,
        email: true,
        role: true,
        language: true,
        avatar_key: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  async create(restaurantId: string, input: CreateTeamMemberInput) {
    this.assertRestaurantId(restaurantId);

    return prisma.user.create({
      data: {
        restaurant_id: restaurantId,
        name: input.name,
        email: input.email.toLowerCase().trim(),
        password_hash: input.password_hash,
        role: input.role,
        language: input.language || "en",
        is_active: true,
      },
      select: {
        id: true,
        restaurant_id: true,
        name: true,
        email: true,
        role: true,
        language: true,
        avatar_key: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async update(restaurantId: string, userId: string, input: UpdateTeamMemberInput) {
    this.assertRestaurantId(restaurantId);

    const existing = await prisma.user.findFirst({
      where: { id: userId, restaurant_id: restaurantId },
    });
    if (!existing) {
      throw AppError.notFound("Team member not found");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.email !== undefined ? { email: input.email.toLowerCase().trim() } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
        ...(input.is_active !== undefined ? { is_active: input.is_active } : {}),
      },
      select: {
        id: true,
        restaurant_id: true,
        name: true,
        email: true,
        role: true,
        language: true,
        avatar_key: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async deactivate(restaurantId: string, userId: string) {
    this.assertRestaurantId(restaurantId);

    const existing = await prisma.user.findFirst({
      where: { id: userId, restaurant_id: restaurantId },
    });
    if (!existing) {
      throw AppError.notFound("Team member not found");
    }

    return prisma.user.update({
      where: { id: userId },
      data: { is_active: false },
      select: {
        id: true,
        restaurant_id: true,
        name: true,
        email: true,
        role: true,
        language: true,
        avatar_key: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}

export const teamRepository = new TeamRepository();
