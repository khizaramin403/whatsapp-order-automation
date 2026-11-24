import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { teamService, TeamService } from "../services/team.service";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/errors";

export class TeamController {
  constructor(private readonly service: TeamService = teamService) {}

  getTeamMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const { search, role, page, pageSize } = req.query;

      const result = await this.service.getTeamMembers(req.user, {
        search: typeof search === "string" ? search : undefined,
        role: role as Role | undefined,
        page,
        pageSize,
      });

      sendSuccess(res, result.team, result.meta);
    } catch (error) {
      next(error);
    }
  };

  getTeamMemberById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const member = await this.service.getTeamMemberById(req.user, req.params.id);
      sendSuccess(res, member);
    } catch (error) {
      next(error);
    }
  };

  createTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const created = await this.service.createTeamMember(req.user, req.body);
      sendSuccess(res, created, undefined, 201);
    } catch (error) {
      next(error);
    }
  };

  updateTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const updated = await this.service.updateTeamMember(req.user, req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  };

  deactivateTeamMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw AppError.unauthenticated("Authentication required");
      const deactivated = await this.service.deactivateTeamMember(req.user, req.params.id);
      sendSuccess(res, deactivated);
    } catch (error) {
      next(error);
    }
  };
}

export const teamController = new TeamController();
