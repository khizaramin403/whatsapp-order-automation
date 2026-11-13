# Project rules (read this first, every session)

Project: WhatsApp Order Automation for restaurants and hotels (multi-tenant).

## Files to read before any work
1. `AGENTS.md` (this file): rules.
2. `DESIGN.md`: exact colors, fonts, sizes, sidebar, buttons, forms, avatars, login, charts (UI work).
3. `PERFORMANCE.md`: state management, rendering, pagination, queue, rate limits, indexes.
4. `docs/PROJECT_PLAN_v1.1.pdf` (or the `.txt` copy) for everything else.
If these files ever disagree, the PDF wins. Do not change these files.

## Source of truth
- The approved plan is `docs/PROJECT_PLAN_v1.1.pdf`. A text copy is `docs/PROJECT_PLAN_v1.1.txt`.
- Design reference images are in `docs/design/` (pages 7 to 14 of the plan: colors, typography, sidebar, buttons, avatars, login, charts).
- Where the text copy and the PDF seem to disagree, the PDF wins. Tables can be flattened in the text copy, so check the design images.

## Hard rules
1. Build exactly what the plan says. Do not add, remove or rename features, pages, tables, endpoints, libraries, colors or fonts that are not in the plan.
2. If something is missing, unclear, or a library version makes the plan's exact syntax impossible, STOP and ask me. List the question and your proposed option. Do not decide silently.
3. Work only on the phase I ask for. Do not start the next phase.
4. Keep the exact values from the plan: hex colors, font names, sizes, spacing, widths (sidebar 264px expanded and 72px collapsed), radius, button states, folder names, table and column names, API paths (`/api/v1/...`).
5. Use current stable versions of tools. If the plan's syntax (for example CSS variables for shadcn) needs a different form in the installed version of Tailwind or shadcn, keep every value identical and change only the syntax. Tell me what you changed.
6. TypeScript everywhere. No `any` unless unavoidable (explain why in a comment).
7. Every user-facing text must come from translation files (`en`, `ar`, `ur-Latn`). No hard-coded UI strings. Use logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`) and never `left`/`right` for layout.
8. Every business table has `restaurant_id`. Every repository query filters by it. It comes from the JWT, never from the request body.
9. Secrets only in `.env` files. Never commit `.env`. Keep `.env.example` updated.
10. Layers in the backend: routes, controllers (request and response only), services (business logic), repositories (Prisma queries).
11. Free tools only. Do not add paid services.
12. Do not use gradients, glows, glassmorphism or extra decoration. Gold is an accent only (see plan Section 7.2).

## Working style
- Before coding a phase: read the relevant plan sections and write a short checklist of what you will build. Wait for my "go" only if you have questions.
- After coding: run the app, lint and tests, then report: what was built, how to run it, what was not done, and any questions.
- Commit with small messages per feature when I ask you to.
- Never delete or overwrite files in `docs/`.

## Stack (from the plan)
Frontend: Next.js (App Router), React, TypeScript, Tailwind, shadcn/ui, lucide-react, Zustand, TanStack Query, TanStack Table, React Hook Form + Zod, next-intl, Recharts via shadcn Chart, Sonner.
Backend: Node.js LTS, Express, TypeScript, Zod, Prisma, jsonwebtoken, bcrypt, helmet, cors, express-rate-limit, BullMQ + Redis, pino, web-push, nodemailer.
Database: PostgreSQL. Local services run with Docker (docker compose). Package manager: pnpm workspaces.
