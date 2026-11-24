# PHASE 3: Backend REST, database and auth (small steps 3.1 to 3.9)

Plan references: Section 10 (10.1 layers, 10.2 REST API, 10.3 JWT, 10.4 rate limiting, 10.6 isolation), Section 11 (tables and indexes), Section 13 Phase 3, PERFORMANCE.md, DECISIONS.md.

How to use:
- Start a NEW conversation for Phase 3. Paste one step at a time (only the text inside the ``` box). After each step do the CHECK, then send the progress line (at the end of this file) and push to GitHub.
- Docker Desktop must be running (`docker compose up -d`) for this whole phase.
- The 9 steps: 3.1 database, 3.2 backend foundations, 3.3 authentication, 3.4 orders API, 3.5 menu, team, settings and analytics APIs, 3.6 security tests, 3.7 API documentation, 3.8 connect the dashboard to the real API, 3.9 review.
- Not in this phase (later): WhatsApp webhook and bot (Phase 4), SSE, push and email (Phase 5), hotel onboarding endpoint and Row Level Security (Phase 6).

---

## Step 3.1: Full Prisma schema, migrations and seed  [Section 11]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 11 (Database Design, 11.1 Indexes, 11.2 Maintenance) of docs/PROJECT_PLAN_v1.1.txt. Also read packages/shared (the types created in Phase 2) so the database and the shared types agree.

STEP 3.1 ONLY: the complete database schema, migrations and seed data in apps/api. No endpoints in this step.

Do exactly this:
1. Complete the Prisma schema with ALL tables from Section 11, using the exact table and column names: restaurants, restaurant_whatsapp, users, refresh_tokens, menu_categories, menu_items, menu_translations, customers, conversations, messages, orders, order_items, order_events, payment_proofs, push_subscriptions, notification_settings. Keep the existing restaurants and users tables and extend them as Section 11 requires.
2. Rules: restaurant_id on every business table; money as integers (minor units); phone numbers stored in E.164; enums for role, order status, order type (delivery, dine_in, pickup), payment method (cod, online), payment status; foreign keys with sensible delete rules; created_at and updated_at where useful.
3. Create EXACTLY the indexes from Section 11.1, including the unique indexes (customers restaurant_id + phone, messages wa_message_id) and a unique (restaurant_id, order number) on orders.
4. Create the migration(s) and apply them to the Docker database. Do not edit old migrations; create new ones.
5. Seed script (pnpm --filter @app/api prisma:seed): one demo hotel (PKR, timezone Asia/Karachi, default language en); users: one super_admin (no restaurant), one owner, one manager, one chef, one rider (dev-only passwords hashed with bcrypt, printed once in the seed output and documented in README under "Development logins"); menu categories and about 15 items with en, ar and ur-Latn translations and aliases; about 40 sample orders across all statuses with items, events and some payment proofs; notification_settings defaults.
6. Make sure the seed can be run again safely (it resets the demo data, not other data).
7. Run lint and typecheck. Show the list of tables and indexes created (query the database).

Do not add endpoints, auth code, WhatsApp code or Row Level Security. Stop after this step. Report what you created.
```
CHECK: the agent shows all 16 tables and the indexes. Open Prisma Studio (`pnpm --filter @app/api prisma:studio`) and see the seeded hotel, users and orders.

---

## Step 3.2: Backend foundations (validation, errors, rate limits, Redis)  [Sections 10.1, 10.2, 10.4]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 10.1, 10.2 and 10.4 of docs/PROJECT_PLAN_v1.1.txt.

STEP 3.2 ONLY: the shared backend foundations in apps/api. No business endpoints yet.

Do exactly this:
1. Standard response helpers for the success format { data, meta } and the error format { error: { code, message, requestId } } from Section 10.2, with an AppError class and error codes (for example VALIDATION_ERROR, UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, RATE_LIMITED, ORDER_INVALID_TRANSITION). Make the existing error middleware use them. Unknown errors return a safe generic message and are logged with pino (never leak stack traces to the client in production).
2. A Zod validation middleware (validate body, query and params) that returns VALIDATION_ERROR with field details.
3. A Redis client (ioredis) in a single module that reads REDIS_URL, with a clean shutdown. Prisma client in a single module with a clean shutdown.
4. Rate limiting as in Section 10.4 using express-rate-limit with a Redis store so counters are shared: a limiter factory and these presets: login (5 per minute, keyed by IP + email), dashboard APIs (100 per minute, keyed by user id), webhook (high limit, keyed by IP; used later). Return the RATE_LIMITED error format with a Retry-After header.
5. A pagination helper (page, pageSize default 20 max 100, meta with page, pageSize, total).
6. Mount everything under the /api/v1 base path; keep GET /health outside it as well.
7. Add Vitest and Supertest tests for the error format, validation errors, pagination helper and the rate limiter.
8. Run lint, typecheck and tests.

Do not add auth or business endpoints. Stop after this step. Report what you created.
```
CHECK: tests pass and `http://localhost:4000/health` still works.

---

## Step 3.3: Authentication (JWT, refresh rotation, roles, tenant)  [Section 10.3]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 10.3 (JWT authentication) and Section 10.2 of docs/PROJECT_PLAN_v1.1.txt.

STEP 3.3 ONLY: authentication in apps/api, following Section 10.3 exactly.

Do exactly this:
1. Password hashing with bcrypt (cost 10 to 12).
2. Access token: JWT, 15 minutes, payload userId, restaurantId, role; returned in the response body only.
3. Refresh token: random, 7 to 30 days (use 14), stored as a HASH in refresh_tokens, sent only in an httpOnly + Secure (secure in production only, so it works on http://localhost) + SameSite cookie. It rotates on every refresh. If an already-used (revoked) refresh token is presented again, revoke ALL sessions of that user and return UNAUTHENTICATED.
4. Endpoints: POST /api/v1/auth/login (login rate limit; the same error "Invalid email or password" for a wrong email or a wrong password; inactive users cannot log in), POST /api/v1/auth/refresh (cookie), POST /api/v1/auth/logout (revokes the current refresh token and clears the cookie), GET /api/v1/auth/me (user, role, restaurant name, language), PATCH /api/v1/auth/me (only the user's own language: en, ar or ur-Latn; this small endpoint is required by DECISIONS.md so the language is saved on the user profile).
5. Middleware: authenticate (verifies the access token), requireRole('owner', 'manager', ...) and a tenant middleware that puts restaurantId from the token on the request. The client must NEVER send restaurantId. The super_admin role has no restaurant and is handled separately.
6. Secrets (JWT secret, cookie settings, token lifetimes) from environment variables validated with Zod; update .env.example. Refuse to start in production with a weak or default secret.
7. Tests: successful login, wrong password, inactive user, login rate limit, access token expiry, refresh rotation, reuse detection revoking all sessions, logout, /me, role middleware allow and deny.
8. Run lint, typecheck and tests.

Do not add business endpoints. Stop after this step. Report what you created and how to log in with the seeded users using curl or a REST client.
```
CHECK: you can log in with the seeded owner (curl or Thunder Client), get an access token and call `/auth/me`. Wrong password gives the generic error.

---

## Step 3.4: Orders API  [Sections 10.2, 10.3, 10.6, 11]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 10.1, 10.2 and 11 of docs/PROJECT_PLAN_v1.1.txt. Read packages/shared for the status transition helper created in Phase 2.

STEP 3.4 ONLY: the orders API, with the layers routes, controllers, services and repositories.

Do exactly this:
1. Repository layer: every query filters by restaurant_id taken from the token (Section 10.6). No repository function may run without a restaurant id.
2. Endpoints under /api/v1:
   - GET /orders: filters status, date range, payment method, order type, search; pagination (page, pageSize); sorted newest first. Returns { data, meta }.
   - GET /orders/:id: order with items, customer, payment proof info and the event timeline.
   - PATCH /orders/:id/status: uses the same transition helper from @app/shared (Section 10.2 flow: PENDING, ACCEPTED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED; PENDING to REJECTED; early states to CANCELLED; dine-in and pickup finish READY then COMPLETED). Invalid moves return ORDER_INVALID_TRANSITION. Every change writes an order_events row with by_user_id.
   - PATCH /orders/:id/payment: payment_status verified or not_received (owner and manager only).
3. Role rules: owner and manager can do everything above. Chef can only move ACCEPTED to PREPARING and PREPARING to READY. Rider can only move READY to OUT_FOR_DELIVERY and OUT_FOR_DELIVERY to DELIVERED, and only for delivery orders.
4. Response shaping by role (data protection): the chef receives ONLY order number, status, type, items and quantities, notes and times. NO customer phone, NO address, NO payment info. The rider receives address, customer name and phone, and the cash amount only for COD orders, and NO payment proof. Implement this in the service layer so it cannot be bypassed by the controller.
5. Order numbers are per hotel (a sequence that does not repeat inside a hotel; use a safe approach inside a transaction and the unique index). Provide an internal service function createOrder (used later by the WhatsApp bot in Phase 4) that creates the order, order_items (name and price snapshots), and the first order_event inside one transaction. It is not exposed as a public endpoint.
6. Validate all inputs with Zod. Apply the dashboard rate limit.
7. Tests (Vitest + Supertest) for each endpoint, filters, pagination, transitions (valid and invalid), role limits, response shaping for chef and rider, and createOrder's transaction.
8. Run lint, typecheck and tests.

Stop after this step. Report what you built and list the endpoints.
```
CHECK: tests pass. With the chef login, the order response has no phone or address.

---

## Step 3.5: Menu, team, settings and analytics APIs  [Section 10.2, 11]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 10.2, 10.5 and 11 of docs/PROJECT_PLAN_v1.1.txt.

STEP 3.5 ONLY: the remaining dashboard APIs, with the same layers and the same rules as Step 3.4 (restaurant_id from the token on every query, Zod validation, dashboard rate limit, standard formats).

Do exactly this:
1. Menu (owner and manager): CRUD for /menu/categories and /menu/items, including translations for en, ar and ur-Latn (name, description, aliases) through menu_translations; reorder categories; PATCH /menu/items/:id/availability. List endpoints are paginated (20). GET menu for any logged-in role of the hotel is allowed only if the plan needs it (the bot reads the menu through a service, not through this endpoint).
2. Team (owner only): CRUD for /team (create user with name, email, role among manager, chef and rider, language; set a temporary password that is hashed; deactivate instead of delete). An owner can only manage users of their own hotel. Nobody can change their own role or deactivate themselves.
3. Settings (owner only): GET and PATCH /settings for the hotel fields in Section 11 and the Settings page (name, timezone, currency, default language, opening hours, delivery fee, minimum order, delivery area note, payment account number and instructions, bot text overrides per language, and the notification_settings switches).
4. GET /analytics/summary (owner only): query parameters for the date range; returns total sales, order count, average order value, COD share, orders per hour, sales per day and top items. Use SQL aggregation with the indexes from Section 11.1, not loading all orders in memory.
5. Cache the menu and hotel settings in Redis with a short TTL and invalidate the cache when they change (Sections 10.6 and PERFORMANCE.md).
6. Tests for each endpoint, role rules, and cache invalidation.
7. Run lint, typecheck and tests.

Do not add SSE, push, email or WhatsApp. Stop after this step. Report what you built and list the endpoints.
```
CHECK: tests pass. A manager cannot call `/team`, `/settings` or `/analytics/summary`.

---

## Step 3.6: Tenant isolation and security tests  [Section 10.6, 15]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 10.6 and Section 15 (Security Checklist) of docs/PROJECT_PLAN_v1.1.txt.

STEP 3.6 ONLY: tests that prove one hotel can never access another hotel's data. Do not add Row Level Security (it is scheduled for Phase 6, see DECISIONS.md).

Do exactly this:
1. Add a test helper that creates two hotels (A and B) with their own users in every role, menu, customers and orders.
2. For EVERY endpoint that exists so far (orders, menu, team, settings, analytics, auth/me), write tests proving that: a user of hotel A cannot list, read, change or delete hotel B data (expect NOT_FOUND or FORBIDDEN, never B's data); a request that includes a restaurantId in the body, query or params is ignored or rejected and never overrides the token; ids of hotel B guessed by hotel A fail.
3. Role tests: for each role, check every endpoint is allowed or denied as designed.
4. Security tests: no access without a token; an expired token is rejected; a token signed with another secret is rejected; refresh token reuse revokes all sessions; responses never contain password hashes, refresh token hashes or WhatsApp tokens; error responses never leak stack traces in production mode.
5. Use a separate test database in the same Docker Postgres (for example a database named with the suffix _test), created and migrated automatically by the test setup, so the demo data is never touched.
6. Run the whole test suite, lint and typecheck.

Stop after this step. Report the list of test files, how many tests pass, and anything you found that leaks data (fix it if so and say what you fixed).
```
CHECK: all tests pass. If the agent reports a leak and fixes it, good: that is what these tests are for.

---

## Step 3.7: API documentation (OpenAPI)  [Section 10.2]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 10.2 of docs/PROJECT_PLAN_v1.1.txt.

STEP 3.7 ONLY: OpenAPI (Swagger) documentation for the endpoints built so far.

Do exactly this:
1. Generate or write an OpenAPI 3 document for every endpoint under /api/v1 (paths, methods, parameters, request bodies from the Zod schemas, responses in the standard success and error formats, required roles, rate limits). Prefer generating it from the existing Zod schemas so docs and validation cannot drift apart.
2. Serve the interactive docs at /api/docs only when NODE_ENV is not production.
3. Document the authentication scheme (Bearer access token and the refresh cookie).
4. Run lint, typecheck and tests.

Stop after this step. Report what you built and the URL.
```
CHECK: open `http://localhost:4000/api/docs` and see the list of endpoints.

---

## Step 3.8: Connect the dashboard to the real API  [Sections 9.2, 10.3, DECISIONS.md]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 9.2 and 10.3 of docs/PROJECT_PLAN_v1.1.txt.

STEP 3.8 ONLY: connect apps/web to the real API. The UI must look and behave the same; only the data source changes.

Do exactly this:
1. Next.js rewrite: proxy /api/* from the web app to the Express server (use an environment variable for the API URL) so the refresh-token cookie is same-origin, as in DECISIONS.md.
2. API client in src/lib/api: a fetch wrapper that adds the access token from the Zustand auth store (in memory only, never localStorage), and on a 401 tries POST /auth/refresh once, retries the request, and if that fails clears the auth store and redirects to /login. Avoid several parallel refresh calls (one refresh at a time).
3. Replace every fake API function from Phase 2 with real calls to the real endpoints, keeping the same function names and return shapes so the hooks and screens do not change. Delete the fake data store files that are no longer used.
4. Real login: replace the temporary fake login with POST /auth/login, with the existing loading, error and too-many-attempts states mapped from the real error codes. Real logout. On page reload, restore the session by calling /auth/refresh then /auth/me (show a full-page skeleton while restoring). Redirect by role after login as before.
5. Remove the temporary role switcher from the topbar (it was marked TEMPORARY). Roles now come from the logged-in user.
6. Remove the fake live-order timer from Phase 2 (real-time arrives in Phase 5). New orders will show after a manual refresh or when the window regains focus (TanStack Query default); do not add polling.
7. Language: when the user changes the language, also call PATCH /auth/me so it is saved on the profile, and use the user's saved language after login.
8. Handle API errors in the UI using the existing Alert, toast and error states, translated in en, ar and ur-Latn (map the error codes to translated messages).
9. Run lint, typecheck, the RTL check, tests and a production build. Start the database, the API and the web app and test with each seeded role: owner, manager, chef, rider.

Do not change the design. Stop after this step. Report what you changed and what you tested, with screenshots (login error, owner orders board with real seeded data, chef kitchen page).
```
CHECK: log in with each seeded user (logins are in the README under "Development logins"). The orders board shows the seeded orders, a status change survives a page reload, and the chef sees no phone or address.

---

## Step 3.9: Phase 3 review against the plan  [Sections 10, 11, 15]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first.

STEP 3.9 ONLY: review Phase 3 against the plan and fix differences. Do not add new features.

Do exactly this:
1. Produce a table comparing the plan with what is built: every table and column of Section 11; the indexes of Section 11.1; every endpoint of Section 10.2 that belongs to Phase 3 (and list the ones intentionally left for later phases: webhook, events, push, admin restaurants); the JWT design of Section 10.3 row by row; the rate limits of Section 10.4; the layering rule of Section 10.1. Status OK or Different for each row.
2. Check that no repository function can run without a restaurant id, that the client never sends restaurantId anywhere, and that secrets are only in environment variables and .env.example is complete.
3. Check the relevant lines of the Security Checklist (Section 15) that apply so far and report each as Done, Partly or Not yet (not yet is fine for items belonging to later phases).
4. Confirm the dashboard no longer imports anything from the fake API files.
5. Fix every Different item. Run lint, typecheck, all tests and a production build for both apps.

Stop after this step. Report the tables, what you fixed, and what still differs and why.
```
CHECK: **Phase 3 is done** when there are no unexplained "Different" rows, all tests pass and you can log in with each role on the real API. Then tell me, and I will write the small-step prompts for Phase 4 (WhatsApp automation).

---

## Progress line (send after each step, in the same conversation)

```
Create or update PROGRESS.md in the project root: add one line for this step with the step number, what was done and today's date. Do not change anything else.
```
