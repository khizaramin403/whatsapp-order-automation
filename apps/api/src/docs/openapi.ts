import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Import existing Zod schemas from route definitions to keep docs and validation in sync
import { loginSchema, languageSchema } from "../routes/auth.routes";
import {
  updateStatusSchema,
  updatePaymentSchema,
} from "../routes/order.routes";
import {
  createCategorySchema,
  updateCategorySchema,
  reorderCategoriesSchema,
  createItemSchema,
  updateItemSchema,
  updateAvailabilitySchema,
} from "../routes/menu.routes";
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from "../routes/team.routes";
import { updateSettingsSchema } from "../routes/settings.routes";

// Cast through generic caller: zod-to-json-schema recursive generic inference can trigger TS2589 on large schemas
const generateOpenApiSchema = zodToJsonSchema as (
  schema: unknown,
  options?: unknown
) => Record<string, unknown>;

function toSchema(zodSchema: z.ZodTypeAny) {
  const jsonSchema = { ...generateOpenApiSchema(zodSchema, { target: "openApi3" }) };
  delete jsonSchema.$schema;
  return jsonSchema;
}

const standardErrorSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: {
      type: "object",
      required: ["code", "message", "requestId"],
      properties: {
        code: { type: "string", example: "VALIDATION_ERROR" },
        message: { type: "string", example: "Validation failed" },
        requestId: { type: "string", example: "c29e2f98-cbf1-4775-998f-bf64b3834169" },
        details: {
          type: "array",
          items: {
            type: "object",
            properties: {
              field: { type: "string", example: "email" },
              message: { type: "string", example: "Invalid email address" },
            },
          },
        },
      },
    },
  },
};

const paginationMetaSchema = {
  type: "object",
  required: ["page", "pageSize", "total", "totalPages"],
  properties: {
    page: { type: "integer", example: 1 },
    pageSize: { type: "integer", example: 20 },
    total: { type: "integer", example: 42 },
    totalPages: { type: "integer", example: 3 },
  },
};

export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "WhatsApp Order Automation API",
    version: "1.0.0",
    description:
      "Multi-tenant backend REST API for restaurant and hotel WhatsApp order automation. Enforces strict tenant isolation by restaurant_id from verified JWTs, role-based access control, response data shaping, and Redis-backed rate limiting.",
  },
  servers: [
    {
      url: "/",
      description: "Default API Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "JWT access token (15-minute lifetime) containing userId, restaurantId, and role. Pass as: `Authorization: Bearer <token>`.",
      },
      RefreshCookie: {
        type: "apiKey",
        in: "cookie",
        name: "refreshToken",
        description:
          "Rotating httpOnly, Secure (in production), SameSite cookie (14-day lifetime) used for session refreshes at POST /api/v1/auth/refresh.",
      },
    },
    schemas: {
      StandardError: standardErrorSchema,
      PaginationMeta: paginationMetaSchema,
      LoginRequest: toSchema(loginSchema),
      LanguageRequest: toSchema(languageSchema),
      UpdateOrderStatusRequest: toSchema(updateStatusSchema),
      UpdatePaymentStatusRequest: toSchema(updatePaymentSchema),
      CreateCategoryRequest: toSchema(createCategorySchema),
      UpdateCategoryRequest: toSchema(updateCategorySchema),
      ReorderCategoriesRequest: toSchema(reorderCategoriesSchema),
      CreateMenuItemRequest: toSchema(createItemSchema),
      UpdateMenuItemRequest: toSchema(updateItemSchema),
      UpdateAvailabilityRequest: toSchema(updateAvailabilitySchema),
      CreateTeamMemberRequest: toSchema(createTeamMemberSchema),
      UpdateTeamMemberRequest: toSchema(updateTeamMemberSchema),
      UpdateSettingsRequest: toSchema(updateSettingsSchema),
    },
    responses: {
      UnauthorizedError: {
        description: "Authentication token missing, expired, or invalid",
        content: {
          "application/json": {
            schema: standardErrorSchema,
            example: {
              error: {
                code: "UNAUTHENTICATED",
                message: "Authentication token required",
                requestId: "auth-123",
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: "Insufficient permissions or unauthorized cross-tenant attempt",
        content: {
          "application/json": {
            schema: standardErrorSchema,
            example: {
              error: {
                code: "FORBIDDEN",
                message: "Insufficient permissions for this action",
                requestId: "forb-123",
              },
            },
          },
        },
      },
      NotFoundError: {
        description: "Resource not found or belongs to a different tenant",
        content: {
          "application/json": {
            schema: standardErrorSchema,
            example: {
              error: {
                code: "NOT_FOUND",
                message: "Order not found",
                requestId: "notf-123",
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Invalid request payload or parameters",
        content: {
          "application/json": {
            schema: standardErrorSchema,
          },
        },
      },
      RateLimitedError: {
        description: "Too many requests; rate limit reached",
        headers: {
          "Retry-After": {
            schema: { type: "integer" },
            description: "Number of seconds to wait before retrying",
          },
        },
        content: {
          "application/json": {
            schema: standardErrorSchema,
            example: {
              error: {
                code: "RATE_LIMITED",
                message: "Too many requests, please try again later",
                requestId: "rl-123",
              },
            },
          },
        },
      },
    },
  },
  paths: {
    // ==========================================
    // Authentication
    // ==========================================
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Staff & Admin Login",
        description:
          "Authenticates user credentials. Rate limit: 5 requests per minute keyed by IP + email. Sets httpOnly refresh token cookie and returns 15-minute JWT access token.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: {
            description: "Successful login",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        accessToken: { type: "string" },
                        user: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            email: { type: "string" },
                            role: { type: "string" },
                            language: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          429: { $ref: "#/components/responses/RateLimitedError" },
        },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Authentication"],
        summary: "Rotate Refresh Token & Issue Access Token",
        description:
          "Reads refresh token from httpOnly cookie, rotates the token in the database, and issues a new access token. If an already-used refresh token is presented, all user sessions are immediately revoked (reuse detection).",
        security: [{ RefreshCookie: [] }],
        responses: {
          200: {
            description: "Token rotated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { accessToken: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout",
        description: "Revokes the active refresh token and clears the authentication cookie.",
        security: [{ RefreshCookie: [] }],
        responses: {
          200: {
            description: "Successfully logged out",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { message: { type: "string", example: "Logged out successfully" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get Current User Profile & Hotel Info",
        description: "Returns profile details and associated restaurant name for the logged-in user.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Profile retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                        language: { type: "string" },
                        restaurant: {
                          type: "object",
                          nullable: true,
                          properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            currency: { type: "string" },
                            timezone: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
      patch: {
        tags: ["Authentication"],
        summary: "Update Current User Language",
        description: "Updates user's preferred language (en, ar, or ur-Latn).",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LanguageRequest" } },
          },
        },
        responses: {
          200: { description: "Language preference updated" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
        },
      },
    },

    // ==========================================
    // Orders
    // ==========================================
    "/api/v1/orders": {
      get: {
        tags: ["Orders"],
        summary: "List Orders",
        description:
          "Returns paginated orders for the authenticated hotel (sorted newest first). Response is role-shaped (Chef receives only prep items/quantities/notes; Rider receives delivery addresses/contact/COD cash). Rate limit: 100/min.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string" }, description: "Filter by OrderStatus" },
          { name: "payment_method", in: "query", schema: { type: "string", enum: ["cod", "online"] } },
          { name: "type", in: "query", schema: { type: "string", enum: ["delivery", "dine_in", "pickup"] } },
          { name: "dateFrom", in: "query", schema: { type: "string" }, description: "ISO date filter" },
          { name: "dateTo", in: "query", schema: { type: "string" }, description: "ISO date filter" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search by number, customer name or phone" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "List of orders",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },
    "/api/v1/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get Order Detail",
        description: "Returns order detail with items, customer info, event timeline, and payment proofs. Response shaped by role.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Order details" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },
    "/api/v1/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Transition Order Status",
        description:
          "Transitions order status according to lifecycle rules. Chef can only move ACCEPTED->PREPARING->READY; Rider can only move READY->OUT_FOR_DELIVERY->DELIVERED on delivery orders. Appends timeline event.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateOrderStatusRequest" } },
          },
        },
        responses: {
          200: { description: "Order status updated" },
          400: { description: "ORDER_INVALID_TRANSITION or validation error", content: { "application/json": { schema: standardErrorSchema } } },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },
    "/api/v1/orders/{id}/payment": {
      patch: {
        tags: ["Orders"],
        summary: "Update Payment Status",
        description: "Owner and manager only. Updates payment_status to 'verified' or 'not_received'.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdatePaymentStatusRequest" } },
          },
        },
        responses: {
          200: { description: "Payment status updated" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },

    // ==========================================
    // Menu Management
    // ==========================================
    "/api/v1/menu/categories": {
      get: {
        tags: ["Menu"],
        summary: "List Categories",
        description: "Owner & manager only. Returns categories with translations and item counts. Cached in Redis.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "List of menu categories" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
      post: {
        tags: ["Menu"],
        summary: "Create Category",
        description: "Owner & manager only. Creates category with multilingual translations in menu_translations.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateCategoryRequest" } },
          },
        },
        responses: {
          201: { description: "Category created" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },
    "/api/v1/menu/categories/reorder": {
      patch: {
        tags: ["Menu"],
        summary: "Reorder Categories",
        description: "Owner & manager only. Atomically updates sort_order for categories.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ReorderCategoriesRequest" } },
          },
        },
        responses: {
          200: { description: "Categories reordered" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },
    "/api/v1/menu/categories/{id}": {
      get: {
        tags: ["Menu"],
        summary: "Get Category",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Category details" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
      patch: {
        tags: ["Menu"],
        summary: "Update Category",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateCategoryRequest" } },
          },
        },
        responses: {
          200: { description: "Category updated" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
      delete: {
        tags: ["Menu"],
        summary: "Delete Category",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Category and linked items/translations deleted" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },
    "/api/v1/menu/items": {
      get: {
        tags: ["Menu"],
        summary: "List Menu Items",
        description: "Owner & manager only. Returns paginated items (default 20) with category filter and search across names/descriptions/aliases.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "category_id", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "is_available", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "List of menu items with pagination",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
      post: {
        tags: ["Menu"],
        summary: "Create Menu Item",
        description: "Owner & manager only. Creates item with integer minor-unit price and translations.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateMenuItemRequest" } },
          },
        },
        responses: {
          201: { description: "Menu item created" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },
    "/api/v1/menu/items/{id}": {
      get: {
        tags: ["Menu"],
        summary: "Get Menu Item",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Item details" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
      patch: {
        tags: ["Menu"],
        summary: "Update Menu Item",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateMenuItemRequest" } },
          },
        },
        responses: {
          200: { description: "Item updated" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
      delete: {
        tags: ["Menu"],
        summary: "Delete Menu Item",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Item deleted" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },
    "/api/v1/menu/items/{id}/availability": {
      patch: {
        tags: ["Menu"],
        summary: "Toggle Item Availability",
        description: "Owner & manager only. Quickly toggles is_available on or off and purges menu cache.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateAvailabilityRequest" } },
          },
        },
        responses: {
          200: { description: "Availability toggled" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },

    // ==========================================
    // Team Management
    // ==========================================
    "/api/v1/team": {
      get: {
        tags: ["Team"],
        summary: "List Team Members",
        description: "Owner only. Paginated list of hotel staff users (manager, chef, rider).",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "role", in: "query", schema: { type: "string", enum: ["manager", "chef", "rider"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          200: {
            description: "List of staff members",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                    meta: { $ref: "#/components/schemas/PaginationMeta" },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
      post: {
        tags: ["Team"],
        summary: "Create Team Member",
        description: "Owner only. Creates staff user with temporary password hashed with bcrypt.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateTeamMemberRequest" } },
          },
        },
        responses: {
          201: { description: "Staff user created" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },
    "/api/v1/team/{id}": {
      get: {
        tags: ["Team"],
        summary: "Get Team Member Details",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Staff user details" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
      patch: {
        tags: ["Team"],
        summary: "Update Team Member",
        description: "Owner only. Users cannot change their own role or deactivate themselves.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateTeamMemberRequest" } },
          },
        },
        responses: {
          200: { description: "Staff user updated" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
      delete: {
        tags: ["Team"],
        summary: "Deactivate Team Member",
        description: "Owner only. Deactivates instead of deleting (is_active: false). Self-deactivation is forbidden.",
        security: [{ BearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          200: { description: "Staff user deactivated" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
          404: { $ref: "#/components/responses/NotFoundError" },
        },
      },
    },

    // ==========================================
    // Settings
    // ==========================================
    "/api/v1/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get Hotel Settings",
        description: "Owner only. Returns hotel info, WhatsApp bot texts, and notification switches. Cached in Redis.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Hotel settings" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
      patch: {
        tags: ["Settings"],
        summary: "Update Hotel Settings",
        description: "Owner only. Updates hotel info, payment instructions, bot texts, or notification switches, and invalidates Redis cache.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateSettingsRequest" } },
          },
        },
        responses: {
          200: { description: "Settings updated" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },

    // ==========================================
    // Analytics
    // ==========================================
    "/api/v1/analytics/summary": {
      get: {
        tags: ["Analytics"],
        summary: "Get Analytics Summary",
        description:
          "Owner only. Computes total sales, order count, AOV, COD share, hourly order volume with peak indicators, daily sales, payment breakdown, and top selling items. Aggregated in PostgreSQL engine using indexed queries.",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "range", in: "query", schema: { type: "string", enum: ["today", "7d", "30d"], default: "today" } },
          { name: "dateFrom", in: "query", schema: { type: "string" }, description: "Custom start date filter" },
          { name: "dateTo", in: "query", schema: { type: "string" }, description: "Custom end date filter" },
        ],
        responses: {
          200: { description: "Analytics summary" },
          401: { $ref: "#/components/responses/UnauthorizedError" },
          403: { $ref: "#/components/responses/ForbiddenError" },
        },
      },
    },
  },
};
