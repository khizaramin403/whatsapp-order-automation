# Antigravity Prompt Pack (for Project Plan v1.1)

How to use: open the project folder in Antigravity, make sure `AGENTS.md` and the `docs/` folder are inside it, then paste ONE prompt at a time into the agent panel. Wait until it finishes, run the "Check" list yourself, then move to the next prompt.

Plan section numbers below refer to `docs/PROJECT_PLAN_v1.1.pdf`.

---

## STEP A. Your computer (manual, no agent)

Install these first (Windows 11):
1. Node.js LTS (nodejs.org). Then in a terminal: `corepack enable` and `corepack prepare pnpm@latest --activate`, then check `pnpm -v`.
2. Git for Windows, and a GitHub account.
3. Docker Desktop (it needs WSL 2, the installer will guide you). Open it once and keep it running.
4. DBeaver (optional, to look at database tables).
5. Cloudflare account or ngrok account (only needed in Phase 4 for the webhook).
6. Meta for Developers account (developers.facebook.com). Start business verification now, it can take days.

Quick check in a terminal: `node -v`, `pnpm -v`, `git --version`, `docker --version`.

## STEP B. Folder structure (what you put inside `whatsapp-order-automation`)

```
whatsapp-order-automation/
  AGENTS.md                      <- rules file (from this pack)
  docs/
    PROJECT_PLAN_v1.1.pdf        <- the plan (from this pack)
    PROJECT_PLAN_v1.1.txt        <- text copy for the agent (from this pack)
    design/
      design-page-07.png ... design-page-14.png   <- design reference pages
  (everything else is created by the agent, in the phases below)
```

Copy the contents of the pack zip into the project folder so that `AGENTS.md` and `docs` sit at the top level. Do not rename them.

Why the PDF AND the text AND the images:
- The PDF is your master copy.
- Agents read plain text more reliably than PDF tables, so the `.txt` copy is what it reads.
- The design images let the agent see colors, sidebar and login exactly as drawn.

Files you must provide later (the agent will ask when needed):
- Phase 4 and later: Meta WhatsApp credentials (test phone number id, access token, app secret, webhook verify token) in `apps/api/.env`.
- Phase 5: an email provider API key (Resend or Brevo free tier) or SMTP details.
- Phase 7: a logo file and brand name if you have them (the plan uses "Your Brand" as a placeholder).
- Optional: a sample menu (items, prices, categories) for the demo hotel, in English, Arabic and Roman Urdu.

## STEP C. Agent settings (check once)

- Open the agent panel and select the strongest model your plan offers. The screenshot shows a "Flash" model, which is fine for small steps, but Phases 3 and 4 (auth, tenant isolation, bot) are better with a stronger model if you have one.
- Look in Antigravity settings for how it handles terminal commands and file edits. A cautious setting (ask before running commands) is a good idea while you learn. The exact option names can differ between versions, so check them in Settings.
- Many agents read `AGENTS.md` from the project root automatically. If yours does not, paste this as the first line of each prompt: "Read AGENTS.md and follow it."
- Work with one agent conversation per phase. Start a new conversation for each prompt.
- Do not edit files by hand while the agent is working on them.

---

## PROMPT 0: Check that the agent understood the plan (do this first)

```
Read AGENTS.md first. Then read docs/PROJECT_PLAN_v1.1.txt completely and look at the images in docs/design/.

Do not write any code or create any files yet.

Reply with:
1. A summary of the project in 10 lines.
2. The list of phases (0 to 7) with one line each.
3. The exact color palette, fonts and sidebar widths you found in Section 7.
4. Anything in the plan that is unclear, contradictory, or likely to break with current versions of Next.js, Tailwind, shadcn/ui, Prisma or next-intl.
5. The questions you need answered before Phase 0.
```

Check: the summary and the colors match the PDF (#10202D, #C7A667, #F7F7F7, Inter, Playfair Display, IBM Plex Sans Arabic, 264px and 72px). Answer its questions, then continue.

---

## PROMPT 1: Phase 0 (Setup and accounts)  [plan Section 13, Phase 0; Sections 5, 6, 17]

```
Read AGENTS.md. Implement ONLY Phase 0 from docs/PROJECT_PLAN_v1.1.txt (Section 13 Phase 0, plus Section 5 Setup Guide, Section 6 Monorepo Folder Structure and Section 17 Day-1 Checklist).

Do exactly this and nothing else:
1. Create the pnpm monorepo with the exact folder structure from Section 6: apps/web, apps/api, packages/shared, docker-compose.yml, .github/workflows, README.md. Add pnpm-workspace.yaml, root package.json, .gitignore, .editorconfig.
2. apps/web: initialize Next.js (App Router, TypeScript, Tailwind, src directory). Do not add any UI yet.
3. apps/api: initialize Express with TypeScript, with a /health endpoint, pino logging, helmet, cors, and environment validation with Zod (src/config). Use the layered folders from Section 6 (config, routes, controllers, services, repositories, middleware, queues, whatsapp, bot, email, utils).
4. docker-compose.yml with PostgreSQL and Redis, with named volumes and ports, and values read from environment variables.
5. Prisma in apps/api with ONLY the restaurants and users tables from Section 11 for now, and the first migration.
6. ESLint, Prettier, TypeScript configs shared across the workspace. Root scripts: dev, build, lint, typecheck, test.
7. .env.example files for apps/web and apps/api. README.md with the exact commands to start everything on Windows.
8. A GitHub Actions workflow that runs install, lint and typecheck.

Do not install shadcn, next-intl, auth, queues, WhatsApp code, or any UI in this phase.

When finished, run: docker compose up -d, the Prisma migration, the API and the web app, and show me proof that /health returns OK. Then give me the report format from AGENTS.md.
```

Check: `docker compose up -d` works, `http://localhost:4000/health` (or the port it chose) answers, the Next.js page opens, the folder structure matches Section 6.

---

## PROMPT 2: Phase 1 (Design system and app shell)  [Sections 7, 8, 9, 13 Phase 1]

```
Read AGENTS.md. Implement ONLY Phase 1 from docs/PROJECT_PLAN_v1.1.txt: "Design system and app shell". Use Section 7 (Design System) as the exact specification, and the images in docs/design/ as the visual reference. Also use Section 8.1 (dashboard languages), Section 9.1 and 9.2 (components and state), and Section 9.4 (shadcn component map).

Do exactly this:
1. Initialize shadcn/ui in apps/web. Put the design tokens from Section 7.3 into globals.css with the exact hex values (adapt only the syntax if the installed Tailwind version requires it, and tell me).
2. Load fonts with next/font exactly as in 7.4: Inter, Playfair Display (600, only for the brand wordmark and login heading), IBM Plex Sans Arabic (when the language is Arabic). Apply the type scale table from 7.4.
3. Install and configure next-intl with three languages: en, ar, ur-Latn (Roman Urdu). Create messages/en.json, messages/ar.json, messages/ur-Latn.json with real translations for every text used in this phase. Language is stored in a cookie. Arabic sets dir="rtl". No hard-coded UI strings.
4. Add shadcn components needed: sidebar, button, input, label, form, checkbox, select, dropdown-menu, avatar, badge, tooltip, sheet, skeleton, spinner, alert, sonner, table, tabs, card, separator. Style them to match Sections 7.7 to 7.11 (button variants and states, form controls, tables, cards, badges, loading and feedback states). Convert any left/right classes in the generated components to logical classes for RTL.
5. App shell exactly as Section 7.6: shadcn Sidebar with collapsible="icon", 264px expanded and 72px collapsed, toggle icon button at the very top of the sidebar (PanelLeftClose / PanelLeftOpen), Ctrl/Cmd+B shortcut, groups Operations / Catalog / Insights / Manage, item hover/active/focus states, order-count badge, tooltips when collapsed, footer with avatar, name, role and user menu (profile, language, sign out), mobile off-canvas sheet. Role-based item hiding using a placeholder role in the auth store.
6. Topbar exactly as in Section 7.6: title, Live dot, sound toggle, notification bell, language switcher (EN, Roman Urdu, AR), avatar menu.
7. Login page exactly as Section 7.13 and Figure 4: two panels, Playfair heading, email and password fields (show/hide icon), remember me, forgot password link, Sign in button with loading spinner, error Alert, language switcher. For now the form does not call a server: it uses a temporary fake login that I will replace in Phase 3. Mark it clearly with a TODO.
8. Avatar component with initials fallback exactly as Section 7.12.
9. Zustand stores: ui.store.ts (sidebarOpen persisted, soundOn, filter) and auth.store.ts (in memory), using narrow selectors as in 9.2.
10. A temporary route /design-check that shows buttons in every state, inputs, badges, skeleton, spinner, alert, toast, table, avatars at all sizes, and the status color badges, so I can compare against the PDF. Remove nothing from it later.

Do not build the Orders, Menu or other pages yet (only empty placeholder pages with the page title so the sidebar links work).

When finished, run the app and test in English, Roman Urdu and Arabic (RTL), sidebar expanded and collapsed, mobile width. Give me screenshots and the report format from AGENTS.md. List any difference between your result and the PDF.
```

Check (open `/design-check` and the login page next to the PDF pages): colors, fonts, sidebar behaviour, Arabic flips correctly, focus rings visible with Tab, contrast (browser DevTools). Ask the agent to fix any difference before moving on.

---

## PROMPT 3: Phase 2 (Frontend screens with mock data)  [Sections 7, 9, 13 Phase 2]

```
Read AGENTS.md. Implement ONLY Phase 2 from docs/PROJECT_PLAN_v1.1.txt: "Frontend screens with mock data". Follow Section 9.3 (rendering and long lists), 9.4 (shadcn map), 9.5 (Pages) and the visual rules in Section 7. Use the design images as reference.

Do exactly this:
1. Pages from Section 9.5: /orders (live board with columns New, Accepted, Preparing, Ready, Out for delivery, Delivered; filters today / COD / online), order detail in a Sheet (customer name and number, items, total, address, payment, screenshot viewer, timeline, status buttons), /kitchen (items and quantities only), /delivery (address, customer number, cash to collect, Delivered button), /menu (categories, items, price, availability switch, translations per language en / ar / ur-Latn, aliases), /analytics (bar chart orders per hour, line or area chart sales, donut COD vs online, top items, using shadcn Chart and the colors in 7.14), /team (staff and roles), /settings (hotel info, hours, delivery fee, payment account number, bot texts, notification and email settings).
2. Role-based visibility of pages as in the plan (owner, manager, chef, rider), using the placeholder role.
3. Data layer: TanStack Query with mock API functions in src/lib/api that return fake data with the exact shapes of the tables in Section 11, so the real API can replace them later with no UI change. Include fake live order arrival (a timer) that updates the TanStack Query cache with setQueryData, plays the sound if enabled, shows a toast and increments the sidebar badge.
4. Performance as in 9.3: server-style pagination (20 per page) on lists, memoized OrderCard and MenuItemRow, stable keys, narrow Zustand selectors, dynamic import for charts and the screenshot viewer. Do NOT add TanStack Virtual unless a list can exceed 200 rows.
5. Loading Skeletons that match the final layout, empty states, error states with Alert, toasts for actions, as in 7.10.
6. Forms with React Hook Form + Zod and translated validation messages.
7. Everything translated in en, ar and ur-Latn. Everything works in RTL. Everything works on mobile.

Do not create any backend code in this phase.

When finished, run the app, test all pages in all 3 languages and mobile, and give me screenshots and the report format from AGENTS.md. List any difference from the PDF.
```

Check: every page opens for the right role, order status changes move cards between columns, fake new orders arrive, Arabic and mobile look right.

---

## PROMPT 4: Phase 3 (Backend REST, database and auth)  [Sections 10, 11, 13 Phase 3]

```
Read AGENTS.md. Implement ONLY Phase 3 from docs/PROJECT_PLAN_v1.1.txt: "Backend REST, database and auth", in apps/api. Use Section 10 (Backend Architecture, including 10.1 to 10.6) and Section 11 (Database Design and indexes) as the exact specification.

Do exactly this:
1. Complete the Prisma schema with ALL tables from Section 11 (including menu_translations, notification_settings, push_subscriptions, payment_proofs), with restaurant_id on every business table, the unique constraints and the indexes from 11.1. Money as integers. Phone numbers in E.164. Create migrations and a seed script (one demo hotel, categories and items with en / ar / ur-Latn translations, one owner, one manager, one chef, one rider, one super admin, a few sample orders).
2. Authentication exactly as Section 10.3: bcrypt, access token 15 minutes (returned in the response body), refresh token in an httpOnly Secure SameSite cookie, stored hashed, rotated on every refresh, reuse detection that revokes all sessions, roles super_admin / owner / manager / chef / rider, requireRole middleware, restaurantId only from the token.
3. REST endpoints from Section 10.2 under /api/v1, with Zod validation, the standard success and error formats, pagination meta, and the order status transition rules from Section 10.2. Do NOT implement the WhatsApp webhook, SSE, push or email here (those are later phases); create only the route files as empty placeholders if the folder structure needs them.
4. Middleware: auth, role, tenant, validation, rate limiting as in 10.4 (login 5 per minute per IP and per email, dashboard 100 per minute per user), request id, error handler, helmet, cors limited by an env variable.
5. Layers as in 10.1: routes, controllers, services, repositories. Every repository query filters by restaurant_id.
6. Tests (Vitest + Supertest): auth flow and refresh rotation, role permissions, order status transitions, and TENANT ISOLATION tests that create two hotels and prove that one cannot read or change the other's data on every resource. Add PostgreSQL Row Level Security as the second lock described in 10.6 if it can be done without breaking Prisma; if it cannot, stop and ask me.
7. OpenAPI (Swagger) documentation for the endpoints.
8. Update .env.example.

Then connect apps/web to the real API: replace the mock functions in src/lib/api with real calls, and replace the temporary fake login from Phase 1 with real login, refresh and logout (access token in memory in the Zustand auth store). Keep the UI unchanged.

When finished, run all tests, run the app, and show me: test results, the list of endpoints, and a working login for each role. Give me the report format from AGENTS.md.
```

Check: all tests pass, logging in as each role shows the right pages, a hotel A user cannot see hotel B data.

---

## PROMPT 5: Phase 4 (WhatsApp automation)  [Sections 8.2, 12, 13 Phase 4]

Before this prompt: add your Meta credentials to `apps/api/.env` (the agent will tell you the variable names from `.env.example`), and start Cloudflare Tunnel or ngrok so Meta can reach your local server.

```
Read AGENTS.md. Implement ONLY Phase 4 from docs/PROJECT_PLAN_v1.1.txt: "WhatsApp automation". Use Section 12 (Bot Conversation Flow and WhatsApp number and cost), Section 8.2 (WhatsApp bot languages), Section 4 (Architecture and order data flow) and Section 10.4 (rate limits).

Do exactly this:
1. Webhook GET (verification) and POST (messages) at /api/v1/webhooks/whatsapp. Verify X-Hub-Signature-256 on the raw body. Save each message with a unique wa_message_id (ignore duplicates). Return 200 quickly and queue the work.
2. BullMQ + Redis queue and a separate worker process (own start script).
3. Find the hotel from phone_number_id using restaurant_whatsapp. Store the WhatsApp access token encrypted (key from env).
4. WhatsApp send client: text, interactive list, reply buttons, receive images and location. Respect the 24-hour window: do not send free-form messages outside it.
5. Bot state machine with the exact states in Section 12: first message asks the language (English / Roman Urdu / Arabic) with buttons and saves customers.language; then menu, cart, order type (delivery / dine-in), address (text or location), payment method (COD / online), awaiting screenshot (download the media and store it as a payment proof in private storage, local folder for now behind a storage interface), confirmed. Every step offers Cancel and Talk to agent. Changing language with the word "language".
6. Bot texts as translation files for en, ar, ur-Latn, with per-hotel overrides from the database. Menu items from menu_translations with fallback to English. Free-text order matching using aliases and the normalization described in 8.2 (lowercase, strip accents and spaces, Arabic-Indic digits to 0-9, unify Arabic letter variants). Interactive lists and buttons are the main path.
7. Business hours check using the hotel's timezone, human takeover (human_until), delivery area and minimum order checks, per-customer spam limit (about 20 messages per minute then a temporary block).
8. On confirmation create the order, order_items (with name and price snapshots) and order_events.
9. Tests: signature check, duplicate message handling, state machine transitions in all three languages, order creation, tenant routing by phone_number_id.
10. A short guide in docs/WHATSAPP_SETUP.md explaining how I connect my Meta test number and webhook step by step (write it from what you built; do not change the plan files).

Do not build SSE, push or email in this phase.

When finished, tell me exactly how to test an order from my phone on the Meta test number, and give me the report format from AGENTS.md.
```

Check: send "menu" from your phone, pick a language, order an item by list and by typing, choose COD, see the order in the dashboard after refreshing, repeat for online payment with a screenshot.

---

## PROMPT 6: Phase 5 (Integration and alerts)  [Sections 10.5, 12, 13 Phase 5]

```
Read AGENTS.md. Implement ONLY Phase 5 from docs/PROJECT_PLAN_v1.1.txt: "Integration and alerts". Use Section 10.5 (Owner alerts) and Section 7.10 (feedback states), plus Section 12.

Do exactly this:
1. SSE endpoint /api/v1/events filtered by restaurant, with authentication. In apps/web a useLiveOrders hook that updates the TanStack Query cache with setQueryData, plays the sound (if enabled), shows a toast, updates the sidebar badge, and shows the Live dot states (green connected, amber reconnecting). Remove the fake order timer from Phase 2.
2. Web Push with VAPID keys (web-push), subscription saving at POST /api/v1/push/subscribe, a PWA manifest and service worker so the dashboard is installable and notifies when the tab is closed.
3. Owner email on every new order, and an optional daily summary, as BullMQ jobs with retries, using nodemailer with the provider settings from .env. Email templates in en, ar and ur-Latn following the owner's language, with order summary, payment type and a button linking to the order. Settings page switches (from the plan) control each alert type.
4. Status changes from the dashboard send the customer a WhatsApp message in the customer's language (Accepted, Preparing, Out for delivery, Delivered). Rejected and cancelled too.
5. Payment verification buttons (Verified / Not received) update payment_status and notify as in the plan.
6. Kitchen and rider screens work live.
7. Tests for the SSE tenant filter, email job, and status message sending.

When finished, tell me how to test: place an order from WhatsApp and show the dashboard update in 2 to 3 seconds, the email, the push notification, and the customer's status message. Give me the report format from AGENTS.md.
```

---

## PROMPT 7: Phase 6 (Multi-tenant and hardening)  [Sections 10.6, 11.2, 15, 13 Phase 6]

```
Read AGENTS.md. Implement ONLY Phase 6 from docs/PROJECT_PLAN_v1.1.txt: "Multi-tenant and hardening". Use Sections 10.4, 10.6, 11.1, 11.2 and 15 (Security Checklist).

Do exactly this:
1. A script or super-admin endpoint to onboard a new hotel (restaurant, WhatsApp number record, owner user, default settings). Onboard a second test hotel and prove isolation with tests across REST, SSE, bot routing and email.
2. Encrypt all WhatsApp tokens (verify they are encrypted at rest).
3. Check indexes with EXPLAIN on the main queries and report the results.
4. Message retention job (delete or archive raw messages older than the configured days) and a daily pg_dump backup script with a restore test, documented in docs/OPERATIONS.md. Do not implement partitioning yet (the plan says only at very large scale).
5. Tune rate limits, add Sentry (free tier) and a documented uptime monitor, structured logs with masked phone numbers and no secrets.
6. Walk through the Security Checklist in Section 15 line by line and report each item as Done, Partly or Not done, with the file that proves it.
7. A small load test for the webhook and report the result.

Give me the report format from AGENTS.md.
```

---

## PROMPT 8: Phase 7 (Deploy, demo and launch)  [Sections 14, 13 Phase 7]

Before this prompt: decide the hosting (plan Section 18 open question), and have your Meta production number and business verification ready.

```
Read AGENTS.md. Implement ONLY Phase 7 from docs/PROJECT_PLAN_v1.1.txt: "Deploy, demo and launch", using Section 14 (Free Hosting Plan).

I choose this hosting: <WRITE YOUR CHOICE HERE: for example "Oracle Cloud Always Free VM" or "Render">.

Do exactly this:
1. Production configuration and a step-by-step deployment guide in docs/DEPLOY.md for: the dashboard, the API, the worker, PostgreSQL, Redis and file storage, using only free options from Section 14. Production Dockerfiles only if needed by my hosting choice. HTTPS and the production webhook URL.
2. Production environment variables list (names only, no secrets) and a pre-launch checklist.
3. A demo hotel with a sample menu in en, ar and ur-Latn and instructions to connect a public demo WhatsApp number.
4. A smoke-test script that checks health, login, webhook verification and an order flow after deploy.

Do not change application features. Give me the report format from AGENTS.md.
```

---

## If the agent goes off-plan

Paste this:

```
You changed something that is not in docs/PROJECT_PLAN_v1.1.pdf. Revert it. List every difference between what you built and the plan (colors, fonts, sizes, pages, tables, endpoints, libraries), then fix each one so it matches the plan exactly. If a difference is unavoidable, explain why and ask me.
```

If you want to change the plan itself: tell me here first, I will update the PDF (v1.2), and you replace the files in `docs/`.
