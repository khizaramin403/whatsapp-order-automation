# DECISIONS.md: Answers and decisions from the owner

These clarify open points. They do not change the plan. If anything here seems to conflict with `docs/PROJECT_PLAN_v1.1.pdf`, stop and ask.

## Answers to the agent's questions
1. **Brand name:** keep the placeholder "Your Brand". Put the brand name in ONE config constant (for example `src/config/brand.ts`) and use it everywhere (sidebar, login, emails, page titles), so it can be changed in one place later.
2. **Order types:** the WhatsApp bot offers Delivery and Dine-in (Section 12). The database `type` column allows delivery, dine_in and pickup (Section 11), but do NOT build a pickup flow or pickup UI now.
3. **Currency and locale:** default currency PKR (shown as "Rs"). Currency, timezone and default language are stored per hotel in `restaurants` (Section 11), so other currencies work later. Format numbers and dates with `Intl`.
4. **Local databases:** Docker Desktop is installed on Windows. Use Docker for local PostgreSQL and Redis.
5. **Meta WhatsApp account:** not created yet. Do nothing about Meta until Phase 4, then give me a step-by-step setup guide (`docs/WHATSAPP_SETUP.md`).

## Decisions on the agent's concerns
1. **Tailwind and shadcn syntax:** use whatever the installed versions require, keep every hex value exactly as in DESIGN.md, and tell me what syntax you changed.
2. **next-intl without locale in the URL:** use the cookie-based setup (`getRequestConfig` reading the language cookie). The dashboard is behind login, so no locale prefix in URLs. The language is also saved on the user profile later (Phase 3).
3. **In-memory access token vs Server Components:** pages that show tenant data are Client Components using TanStack Query with the access token from the Zustand auth store. Route API calls through a Next.js rewrite (`/api` proxied to the Express server) so the refresh-token cookie is same-origin (plan Section 10.3). Server Components are used only for layouts and static parts.
4. **Row Level Security:** in Phase 3 enforce `restaurant_id` in every repository query and prove it with tests. Add PostgreSQL Row Level Security in Phase 6 (hardening), using a per-transaction setting. Ask me before choosing how.
5. **Meta 24-hour window:** send free-form status messages only inside the 24-hour window. If the window is closed, do not send, and log it. Template messages are out of scope for now.

## Working method
- Work in small steps. Each prompt is one step. Stop after the step and report.
- Do not read the whole plan again for every step. Read AGENTS.md, DESIGN.md, PERFORMANCE.md, DECISIONS.md, and only the plan sections named in the prompt.
