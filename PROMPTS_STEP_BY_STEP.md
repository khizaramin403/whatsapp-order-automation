# Step-by-step prompts (Phase 0 and Phase 1)

How to use:
- One prompt at a time. Paste it in the agent panel, wait until it finishes, do the CHECK, then go to the next one.
- Use one conversation per phase. Start a new conversation when a new phase starts.
- If a step fails or looks wrong, do not go forward. Show me the agent's report or a screenshot.
- Later phases (2 to 7) will get their own small-step prompts when you reach them.

Every prompt starts with this same first paragraph (already included below):
"Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. ..."

---

# PHASE 0: Setup

## Step 0.1: Monorepo skeleton  [plan Section 6, Section 13 Phase 0]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 6 (Monorepo Folder Structure) of docs/PROJECT_PLAN_v1.1.txt.

STEP 0.1 ONLY: create the monorepo skeleton. Do not install Next.js, Express, Prisma or Docker yet.

Do exactly this:
1. Create the pnpm workspace at the project root: pnpm-workspace.yaml (apps/*, packages/*), root package.json (name, private, packageManager field, empty scripts for now), .gitignore (node_modules, .env, .next, dist, coverage, .turbo, *.log, docker volumes), .editorconfig.
2. Create the empty folder structure from Section 6: apps/web, apps/api, packages/shared, .github/workflows. Put a .gitkeep file in empty folders. Create a short README.md with the project name and one paragraph.
3. Do NOT touch AGENTS.md, DESIGN.md, PERFORMANCE.md, DECISIONS.md, PROMPTS.md, PROMPTS_STEP_BY_STEP.md or the docs folder.
4. Run pnpm -v and node -v and show the output.

Stop after this step. Report: files created, anything you were unsure about.
```
CHECK: the folders `apps/web`, `apps/api`, `packages/shared` exist. `docs` and the .md files are unchanged.

## Step 0.2: Next.js app  [Section 6, Section 3.1]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first.

STEP 0.2 ONLY: create the web app in apps/web.

Do exactly this:
1. Initialize Next.js with the App Router, TypeScript, Tailwind CSS, ESLint and a src directory, inside apps/web, using non-interactive flags. Use pnpm.
2. Set the package name to @app/web. Keep the default starter page but remove the default Next.js demo content so the page only shows the text "Web app is running".
3. Create the empty folders from Section 6 under apps/web/src: components/ui, components/layout, components/orders, components/menu, components/charts, stores, lib, hooks, styles (with .gitkeep). Create apps/web/messages (empty, with .gitkeep).
4. Do NOT install shadcn, next-intl, Zustand, TanStack, or any UI library yet. Do not add any styling.
5. Start the dev server and confirm http://localhost:3000 shows "Web app is running".

Stop after this step. Report what you created and any version-related notes (Next.js and Tailwind versions installed).
```
CHECK: open `http://localhost:3000` in the browser and you see "Web app is running". Note the Tailwind version the agent reports.

## Step 0.3: Express API with /health  [Section 6, Section 10.1, Section 3.2]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 6 and Section 10.1 of docs/PROJECT_PLAN_v1.1.txt.

STEP 0.3 ONLY: create the API app in apps/api.

Do exactly this:
1. Initialize apps/api as a Node.js + TypeScript + Express project (package name @app/api). Use pnpm. Use tsx for the dev script (watch mode) and tsc for the build.
2. Create the layered folders from Section 6 under apps/api/src: config, routes, controllers, services, repositories, middleware, queues, whatsapp, bot, email, utils (with .gitkeep where empty).
3. src/config: environment validation with Zod (PORT default 4000, NODE_ENV, DATABASE_URL, REDIS_URL, CORS_ORIGIN). The app must stop with a clear message if required variables are missing.
4. src/index.ts or src/app.ts: Express app with helmet, cors (origin from CORS_ORIGIN), JSON body parsing, pino and pino-http logging, a request id, and a GET /health endpoint that returns { "status": "ok" }.
5. A basic error-handling middleware that returns the standard error format from Section 10.2 ({ "error": { "code", "message", "requestId" } }).
6. Create apps/api/.env.example with the variables above.
7. Do NOT add Prisma, Redis code, auth, WhatsApp code or any other endpoint.
8. Create a local .env from .env.example, start the API and show that http://localhost:4000/health returns {"status":"ok"}.

Stop after this step. Report what you created.
```
CHECK: `http://localhost:4000/health` shows `{"status":"ok"}`.

## Step 0.4: Docker and Prisma  [Section 11, Section 5]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 5 and Section 11 of docs/PROJECT_PLAN_v1.1.txt.

STEP 0.4 ONLY: local databases and the first Prisma migration.

Do exactly this:
1. Create docker-compose.yml at the project root with PostgreSQL (version 16 or newer) and Redis, with named volumes, port mappings, healthchecks, and all credentials read from environment variables. Create a root .env.example with those variables, and a local .env.
2. Install Prisma in apps/api (follow the current Prisma documentation for the installed version, including its config file requirements). Create the schema with ONLY the restaurants and users tables from Section 11, with the exact column names listed there, a Role enum (super_admin, owner, manager, chef, rider), and restaurant_id on users. Money and phone rules from Section 11 apply (not needed yet for these two tables).
3. Create the first migration and apply it to the Docker database.
4. Add pnpm scripts in apps/api: prisma:migrate, prisma:studio, prisma:generate.
5. Run: docker compose up -d. Show that both containers are healthy. Show the migration result and the list of tables created.
6. Make sure the API still starts and /health still works.

Do NOT add other tables, seed data, auth, or any Redis code.

Stop after this step. Report: how to start and stop the databases, and anything that failed and how you fixed it.
```
CHECK: Docker Desktop shows two running containers (Postgres and Redis). The agent shows `restaurants` and `users` tables.

## Step 0.5: Tooling, README and CI  [Section 13 Phase 0, Section 17]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 13 (Phase 0) and Section 17 (Day-1 Checklist) of docs/PROJECT_PLAN_v1.1.txt.

STEP 0.5 ONLY: code quality tooling, README and CI.

Do exactly this:
1. Shared TypeScript base config at the root, extended by apps/web, apps/api and packages/shared.
2. ESLint and Prettier configured for the whole workspace (flat config if the installed ESLint version uses it). Keep Next.js lint rules for apps/web.
3. Make packages/shared a valid package (@app/shared) with an empty src/index.ts.
4. Root scripts: dev (starts web and api together), dev:web, dev:api, build, lint, typecheck, test (can be a placeholder that passes until tests exist), db:up, db:down.
5. Final .env.example files for apps/web and apps/api (add NEXT_PUBLIC_API_URL for the web app) and a root .env.example for docker.
6. README.md with the exact commands for Windows: install tools, pnpm install, copy env files, docker compose up -d, run migration, pnpm dev, and the URLs (web 3000, api 4000/health).
7. GitHub Actions workflow .github/workflows/ci.yml that runs install, lint and typecheck on push and pull request.
8. Run pnpm lint and pnpm typecheck and show that both pass. Fix anything that fails.

Stop after this step. Report what you created and the result of lint and typecheck.
```
CHECK: `pnpm dev` starts both apps, lint and typecheck pass. **Phase 0 is done.**

---

# PHASE 1: Design system and app shell
Start a NEW conversation for Phase 1. Sources: DESIGN.md (all values), PERFORMANCE.md, plan Sections 7, 8.1, 9.1, 9.2, 9.4.

## Step 1.1: shadcn, tokens and fonts  [DESIGN.md: Colors, Tokens, Typography]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at docs/design/design-page-07.png and design-page-08.png.

STEP 1.1 ONLY: shadcn/ui setup, design tokens and fonts in apps/web.

Do exactly this:
1. Initialize shadcn/ui in apps/web (follow the current shadcn documentation for the installed Tailwind version). Use lucide-react for icons. Do not choose a different base color theme: the colors come from DESIGN.md.
2. Put the design tokens from the "Design tokens (shadcn CSS variables)" section of DESIGN.md into the global stylesheet with the exact hex values. Also add the extra tokens needed for the status colors (success, warning, danger, info, gold, midnight tint, neutral fill and text pairs) with exactly the hex values in DESIGN.md. Adapt only the syntax if required by the installed Tailwind version, and tell me what you changed.
3. Load fonts with next/font exactly as in the Typography section: Inter (400, 500, 600), IBM Plex Sans Arabic (400, 500, 600) and Playfair Display (600). Make Inter the default body font. Provide CSS variables or classes so Arabic text uses IBM Plex Sans Arabic when html lang is "ar", and a class for Playfair Display used only for the brand wordmark and login heading. Enable tabular numerals through a utility class for prices and numbers.
4. Apply the type scale from the Typography table as reusable styles or utility classes (page title, section title, card title, body, label, caption, table header, KPI number, login heading).
5. Set the page background to Soft White and the text to Midnight Blue. Apply the radius, shadow and motion values from "Spacing, radius, shadow, motion".
6. Create src/config/brand.ts with one constant for the brand name ("Your Brand") as in DECISIONS.md.
7. Replace the home page text with a simple test page that shows each text style and every color swatch with its name and hex, so I can compare with the PDF. Do not build any app UI yet.
8. Run lint and typecheck, start the app and confirm it works.

Stop after this step. Report what you did, the Tailwind and shadcn versions, and any syntax you had to change.
```
CHECK: the test page shows the colors and fonts correctly (Inter body, Playfair only for the wordmark sample).

## Step 1.2: Languages and RTL  [DESIGN.md: RTL and languages; plan Section 8.1]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 8.1 of docs/PROJECT_PLAN_v1.1.txt.

STEP 1.2 ONLY: translations and right-to-left support in apps/web.

Do exactly this:
1. Install and configure next-intl using the cookie-based setup without locale in the URL (see DECISIONS.md). Supported languages: en, ar, ur-Latn (Roman Urdu). Default is en. No Urdu script.
2. Create apps/web/messages/en.json, ar.json and ur-Latn.json with a few real keys for now (common words: save, cancel, sign in, orders, kitchen, delivery, menu, analytics, team, settings, language). Provide real Arabic and real Roman Urdu translations.
3. Set html lang and dir from the language (dir="rtl" for ar). Load the correct font per language (Section Typography in DESIGN.md). Numbers use Western digits.
4. A server action or route to change the language and store it in a cookie, and a small temporary test control on the test page with three buttons (English, Roman Urdu, Arabic) that switches the language. The final language switcher is built in a later step.
5. On the test page, show the translated words and a few layout samples that use logical Tailwind classes (ms-, me-, ps-, pe-, start-, end-, text-start) to prove that Arabic flips correctly.
6. Add an ESLint rule or a simple check script that warns about left/right Tailwind classes (ml-, mr-, pl-, pr-, left-, right-, text-left, text-right) in apps/web/src, so we catch RTL mistakes.
7. Run lint and typecheck, test all three languages in the browser.

Stop after this step. Report what you did.
```
CHECK: switching to Arabic flips direction and changes the font; Roman Urdu looks like normal Latin text.

## Step 1.3: Core shadcn components styled to the design  [DESIGN.md: Buttons, Form controls, Tables, Loading states]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at docs/design/design-page-11.png and design-page-12.png.

STEP 1.3 ONLY: add and style the shadcn components in apps/web/src/components/ui.

Do exactly this:
1. Add these shadcn components: button, input, label, form, checkbox, switch, select, dropdown-menu, avatar, badge, tooltip, sheet, drawer, dialog, alert-dialog, skeleton, spinner (or a Spinner built from the lucide Loader icon if shadcn has none), alert, sonner, table, tabs, card, separator, pagination, popover, command, progress, chart.
2. Style them exactly as in DESIGN.md: button variants (Primary, Accent gold, Secondary, Ghost, Destructive) with the default, hover, pressed, disabled and focus states and sizes (40px, small 32px); a loading state for buttons (spinner before the label, disabled); input and select states; checkbox and switch; dropdown lists with the gold-tint selected item; tables (52px rows, header style, hover and selected row); cards (including the clickable card with a gold border on hover); tabs with a 2px gold underline; sheet at 480px; skeleton with the shimmer; alert tints; sonner toast position and style.
3. Create a Badge variant for every status color pair in DESIGN.md (success, warning, danger, info, gold, midnight tint, neutral) at 22px height.
4. After adding each component, convert any left/right classes to logical classes for RTL, and flip directional icons with the rtl: variant.
5. Respect prefers-reduced-motion for the shimmer and transitions.
6. Do NOT build any page yet except the temporary test page in the next step.

Run lint and typecheck. Stop after this step. Report which components were added and what you customized.
```
CHECK: no errors; nothing visible yet except possibly the test page.

## Step 1.4: /design-check page  [DESIGN.md: whole file]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at all images in docs/design/.

STEP 1.4 ONLY: create a temporary route /design-check in apps/web that shows every component in every state so I can compare with the PDF.

It must show, in clearly labeled sections: the color palette; the type scale; all five button variants in default, hover (use a forced-hover demo class), pressed, disabled, loading and focus states; sizes; inputs (default, focus, error, disabled) and select; checkbox and switch; badges for every status; a table with header, hover row and selected row and pagination; cards including the clickable one; tabs; a sheet that opens; a dropdown menu; a dialog and an alert dialog; skeleton shapes; a spinner; all alert variants; buttons that trigger a success toast, an error toast and a persistent alert; avatars at 24, 32, 40 and 64px on light and on a midnight background with the fallback initials; the icon set from DESIGN.md; a chart sample (bar, line and donut) with the chart colors from DESIGN.md.
The page must work in English, Roman Urdu and Arabic (use the temporary language buttons from step 1.2).

Do not remove this page later. Run lint and typecheck.

Stop after this step. Report what you built.
```
CHECK (do this yourself, side by side with the PDF pages 7 to 14): colors, fonts, hover and focus, shimmer, Arabic flip. Tell the agent exactly what differs, or show me screenshots.

## Step 1.5: Stores and sidebar shell  [DESIGN.md: App layout, Sidebar; plan Section 9.2]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at docs/design/design-page-09.png, design-page-10.png and design-page-11.png.

STEP 1.5 ONLY: Zustand stores and the sidebar of the app shell.

Do exactly this:
1. Install Zustand. Create src/stores/ui.store.ts (sidebarOpen persisted, soundOn, filter, selectedOrderId) and src/stores/auth.store.ts (in memory only: accessToken, user { name, role, restaurantId }, setAuth, clearAuth). Use narrow selectors everywhere, as in PERFORMANCE.md. For now the auth store is filled with a placeholder owner user.
2. Create the app shell layout for the dashboard routes (route group, for example (app)) with the shadcn Sidebar using collapsible="icon", 264px expanded and 72px collapsed, 200ms ease-out, Ctrl/Cmd+B shortcut, state persisted.
3. Build the sidebar exactly as the "Sidebar" part of DESIGN.md: header 64px with brand mark and wordmark (Playfair) and the toggle icon button at the very top (PanelLeftClose / PanelLeftOpen); groups Operations (Orders, Kitchen, Delivery), Catalog (Menu), Insights (Analytics), Manage (Team, Settings) with the group label style (dividers when collapsed); items with default, hover, active (gold icon, 3px gold bar) and keyboard focus states; the new-order badge (gold pill, gold dot when collapsed); tooltips when collapsed; footer with avatar, name, role and chevron (the user menu is built in the next step, so only the trigger area for now); hide items by role (a chef sees only Kitchen, a rider only Delivery, manager and owner see all except where the plan says owner-only: Analytics, Team, Settings).
4. Mobile under 768px: off-canvas sheet (the menu button comes in the next step; for now open it with a temporary button).
5. Create the placeholder pages /orders, /kitchen, /delivery, /menu, /analytics, /team and /settings, each showing only its translated title inside the shell.
6. Everything translated in en, ar and ur-Latn. RTL: sidebar on the right, gold bar on the right edge, toggle icons mirror.
7. Use the brand name from src/config/brand.ts.

Run lint and typecheck. Stop after this step. Report what you built and show screenshots of: expanded, collapsed, collapsed with a tooltip, mobile, and Arabic.
```
CHECK: compare with Figure 1 and Figure 2 in the PDF (page 10). The toggle is at the very top and the collapse works.

## Step 1.6: Topbar, user menu and language switcher  [DESIGN.md: Topbar, Avatars]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at docs/design/design-page-10.png and design-page-13.png.

STEP 1.6 ONLY: topbar, avatar and user menu.

Do exactly this:
1. Topbar exactly as the "Topbar" part of DESIGN.md: 64px, white, bottom border; page title on the inline-start side with the menu button for mobile; on the inline-end side in this order: Live dot with the word "Live" (green when connected; for now always green, with an amber "Reconnecting" state ready to use), sound toggle (Volume2 / VolumeOff, bound to soundOn), notification bell, language switcher (EN, Roman Urdu, AR, replacing the temporary buttons), avatar with the user menu. On mobile show only title, live dot, bell and avatar.
2. Avatar component exactly as the "Avatars" part of DESIGN.md: sizes 24, 32, 40, 64; photo support with border; initials fallback colors on light and on the dark sidebar.
3. User menu (shadcn DropdownMenu): profile, language, sign out. Sign out clears the auth store (login comes in step 1.7).
4. Hook the sidebar footer trigger to the same user menu.
5. All text translated in en, ar and ur-Latn. RTL works.

Run lint and typecheck. Stop after this step. Report what you built, with screenshots of desktop, mobile and Arabic.
```

## Step 1.7: Login page  [DESIGN.md: Login screen]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at docs/design/design-page-14.png (Figure 4, the login screen).

STEP 1.7 ONLY: the login page.

Do exactly this:
1. Build /login exactly as the "Login screen" part of DESIGN.md and Figure 4: two panels on desktop (midnight brand panel with the wordmark, the two-line serif statement, the 64px gold rule, one muted supporting line and the faint concentric-circle pattern; soft white form panel), only the form with the brand mark above it on mobile.
2. Form card: max width 400px, brand mark, heading "Welcome back" in Playfair 34px, helper text, Email field, Password field with show/hide eye icon, Remember me checkbox, "Forgot password?" link in Gold Text, full-width Primary "Sign in" button (46px). Language switcher pill (EN, Roman Urdu, AR) at the top corner of the form panel.
3. Validation with React Hook Form + Zod, with translated messages. Loading state: spinner and "Signing in...", fields disabled. Error Alert: "Invalid email or password" (never say which). A warning Alert for too many attempts.
4. TEMPORARY fake login (no server): any email and password work, except the email "fail@test.com" which shows the error Alert and "wait@test.com" which shows the too-many-attempts Alert. Add a clear TODO comment that Phase 3 replaces this with the real API. Role for testing: if the email starts with "chef" use role chef, "rider" use rider, "manager" use manager, otherwise owner.
5. After login: owner and manager go to /orders, chef to /kitchen, rider to /delivery. Protect the dashboard routes: not logged in goes to /login (client-side check using the auth store for now).
6. Accessibility: autofocus on email, Enter submits, visible focus rings, labels connected to inputs, password-manager friendly attributes.
7. Everything translated in en, ar and ur-Latn and flips correctly in RTL.

Run lint and typecheck. Stop after this step. Report what you built with screenshots (desktop, mobile, Arabic, error state, loading state).
```

## Step 1.8: Review against the PDF and fix  [whole of Section 7]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at all images in docs/design/.

STEP 1.8 ONLY: review Phase 1 against the plan and fix differences. Do not add new features.

Do exactly this:
1. Go through DESIGN.md section by section (colors, typography, spacing and radius, sidebar, topbar, buttons, forms, tables and cards, loading states, icons, avatars, login, charts, RTL, do/do-not) and compare with what is built. Produce a table: item, expected (from DESIGN.md), actual, status (OK or Different).
2. Fix every Different item so it matches DESIGN.md exactly.
3. Check contrast of every text and background pair used in the shell and login with a script or the browser, against DESIGN.md's targets (4.5:1 text, 3:1 icons and focus rings). Report any failure instead of changing colors silently.
4. Check keyboard navigation (Tab order, focus rings, Esc closing menus and sheets), prefers-reduced-motion, mobile width (375px) and Arabic RTL on login and on the shell.
5. Search apps/web/src for left/right Tailwind classes and for hard-coded UI strings, and fix them.
6. Run lint, typecheck and a production build (pnpm build).

Stop after this step. Report the table, what you fixed, and what still differs and why.
```
CHECK: **Phase 1 is done** when the table has no "Different" rows (or each one is explained) and the build passes.

---

After Phase 1, tell me the result and I will write the small-step prompts for Phase 2.
