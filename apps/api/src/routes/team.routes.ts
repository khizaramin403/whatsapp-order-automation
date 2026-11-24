import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { teamController } from "../controllers/team.controller";
import { authenticate, tenant, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { dashboardLimiter } from "../middleware/rateLimiter";

const createTeamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("A valid email address is required"),
  password: z.string().min(8, "Temporary password must be at least 8 characters"),
  role: z.enum([Role.manager, Role.chef, Role.rider], {
    errorMap: () => ({ message: "Role must be manager, chef, or rider" }),
  }),
  language: z.enum(["en", "ar", "ur-Latn"]).optional(),
});

const updateTeamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("A valid email address is required").optional(),
  role: z.nativeEnum(Role).optional(),
  language: z.enum(["en", "ar", "ur-Latn"]).optional(),
  is_active: z.boolean().optional(),
});

const getTeamQuerySchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

const idParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const teamRouter = Router();

// Middleware: Authenticate, tenant isolation, rate limit, role owner
teamRouter.use(
  authenticate,
  tenant,
  dashboardLimiter,
  requireRole(Role.owner, Role.super_admin)
);

teamRouter.get("/", validate({ query: getTeamQuerySchema }), teamController.getTeamMembers);
teamRouter.post("/", validate({ body: createTeamMemberSchema }), teamController.createTeamMember);
teamRouter.get("/:id", validate({ params: idParamSchema }), teamController.getTeamMemberById);
teamRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateTeamMemberSchema }),
  teamController.updateTeamMember
);
teamRouter.delete("/:id", validate({ params: idParamSchema }), teamController.deactivateTeamMember);

export default teamRouter;
