# PHASE 2: Frontend screens with mock data (small steps 2.1 to 2.8)

Plan references: Sections 9.3, 9.4, 9.5, 7.6 to 7.14 (DESIGN.md), 10.2 (status flow), 11 (table shapes), 13 Phase 2.

How to use:
- Start a NEW conversation for Phase 2. Paste one step at a time (only the text inside the ``` box). After each step do the CHECK, then send the progress line (at the end of this file).
- Everything in Phase 2 uses FAKE data. No backend, no database, no real login. The real API replaces the fake functions in Phase 3.
- The 8 steps: 2.1 data layer, 2.2 orders board, 2.3 order detail and live fake orders, 2.4 kitchen and delivery, 2.5 menu, 2.6 analytics, 2.7 team and settings, 2.8 review.

---

## Step 2.1: Types, fake data layer and role guard  [Section 11, 9.2, 10.2]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Then read Section 9.2, Section 9.5, Section 10.2 and Section 11 of docs/PROJECT_PLAN_v1.1.txt.

A basic app shell, sidebar, topbar and login already exist from Phase 1. Do not rebuild them.

STEP 2.1 ONLY: the data layer with fake data. No new pages in this step.

Do exactly this:
1. In packages/shared (exported as @app/shared) create TypeScript types (and Zod schemas where useful) for: Restaurant, User and Role, MenuCategory, MenuItem, MenuTranslation (languages en, ar, ur-Latn, with aliases), Customer, Order, OrderItem (with name and price snapshots), OrderEvent, PaymentProof, OrderStatus, PaymentMethod (cod, online), PaymentStatus, OrderType (delivery, dine_in, pickup). Use the exact field names and rules from Section 11 (money as integer minor units, phone in E.164, restaurant_id on every business type).
2. Also in packages/shared: the allowed order status transitions from Section 10.2 as one helper (canTransition(from, to, orderType) and nextStatuses(status, orderType)).
3. In apps/web/src/lib/api create fake API functions that return Promises with realistic fake data and a short artificial delay (300 to 600 ms) so loading skeletons are visible: getOrders (with filters status, date, payment and pagination page and pageSize 20, returning data and meta as in Section 10.2), getOrder, updateOrderStatus, updatePaymentStatus, getMenu (categories and items with translations), updateMenuItem, setItemAvailability, getAnalyticsSummary, getTeam, getSettings, updateSettings. Keep the fake data in an in-memory store so changes (status updates) persist until reload. Seed it with one hotel, about 40 orders across all statuses (mix of COD and online, delivery and dine-in, some with a payment proof placeholder image), about 15 menu items in 3 categories with en, ar and ur-Latn names and aliases, and the 4 staff roles.
4. Set up TanStack Query: install it, a QueryClientProvider in the app, a query key factory (src/lib/query-keys.ts), and hooks in src/hooks: useOrders, useOrder, useMenu, useTeam, useSettings, useAnalytics, plus mutation hooks that update the cache with setQueryData where the plan says so (Section 9.3). Do not use Context API for shared data.
5. A RoleGuard component (src/components/layout/RoleGuard.tsx) and route protection: each dashboard page is visible only to the roles in Section 9.5; if the role is not allowed, redirect to that role's home page (owner and manager to /orders, chef to /kitchen, rider to /delivery).
6. Fake data must contain Arabic and Roman Urdu names that look real (for example Arabic customer and item names), and prices in PKR as integer minor units. Format money with Intl using the hotel's currency from the data.
7. Add unit tests (Vitest) for the status transition helper. Install Vitest only if it is not installed yet, and make pnpm test run it.

Do not build any screens in this step. Run lint, typecheck and tests. Stop after this step. Report what you created.
```
CHECK: lint, typecheck and tests pass. Nothing new is visible in the browser yet, and the existing pages still work.

---

## Step 2.2: Orders board  [Section 9.5 /orders, 9.3, Figure 1 on design-page-10.png]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at docs/design/design-page-10.png (Figure 1) and design-page-09.png. Read Section 9.3, 9.5 and 10.2 of docs/PROJECT_PLAN_v1.1.txt.

STEP 2.2 ONLY: the /orders page (the live board). The order detail sheet comes in the next step.

Do exactly this:
1. Build /orders as in Figure 1: a row of 4 KPI cards on top (New orders, In kitchen, Out for delivery, Today's sales), then the board with columns New (pending), Accepted, Preparing, Ready, Out for delivery, Delivered. On small screens the columns become horizontally scrollable tabs or a stacked list (choose the simplest that works on a phone).
2. OrderCard component (memoized with React.memo, stable key order.id): order number and customer name, time since created, items summary, payment badge (COD or Online with status), total, short address, and the action button for the next status. Hover state: gold border as in DESIGN.md. At most ONE gold button style per screen: the "Accept" button is the Accent button; other actions are Primary or Secondary.
3. Status buttons use the fake API and the transition helper from @app/shared. Reject and Cancel use an AlertDialog to confirm. After a change the card moves to the right column by updating the TanStack Query cache with setQueryData, not by refetching the whole list.
4. Filters from the ui store: Today, COD, Online. Use narrow selectors.
5. Pagination (20 per page) inside the Delivered column (history) with a "Load more" button. Other columns show active orders.
6. Loading: Skeleton shapes that match the cards and KPI cards. Empty state for an empty column. Error state with Alert and Retry.
7. Role visibility: only owner and manager see this page (RoleGuard).
8. Everything translated in en, ar and ur-Latn, RTL correct, mobile correct.

Do not build the detail sheet or the fake live arrivals yet. Run lint, typecheck and the RTL check. Stop after this step. Report what you built with screenshots (desktop, mobile, Arabic, loading state).
```
CHECK: compare with Figure 1. Clicking Accept moves a card to the next column. Switching to Arabic flips the board.

---

## Step 2.3: Order detail sheet and fake live orders  [Section 7.9, 7.10, 9.5, 10.2]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Read Section 7.9 and 7.10 (in DESIGN.md), and Sections 9.3, 9.5 of docs/PROJECT_PLAN_v1.1.txt.

STEP 2.3 ONLY: the order detail sheet and the fake live order arrivals.

Do exactly this:
1. Order detail in a shadcn Sheet, 480px wide on desktop and a bottom sheet on mobile, opened when a card is clicked (the selected order id lives in the ui store). Contents: title with order number, status badge, customer name and phone (with a tap-to-call link), order type, items with quantity and price, subtotal, delivery fee, total, address (or table note for dine-in), scheduled time, payment method and payment status, the payment screenshot (placeholder image in a viewer that opens larger; the viewer is loaded with dynamic import), a timeline built from order events with the avatar and name of who did each step, and sticky action buttons at the bottom for the next status. For online payments with a screenshot show two buttons: "Payment verified" and "Not received" (fake API). A short note under them: the screenshot is only a hint, confirm the money in your bank or wallet app.
2. Fake live arrivals: a timer (every 40 to 60 seconds) adds a new pending order through the fake API and updates the cache with setQueryData. When it arrives: a toast (Sonner), a short chime if soundOn is true (use a small local audio file or the Web Audio API, no external download), the sidebar new-order badge count increases, and the card appears at the top of New. Mark this timer clearly with a TODO: "removed in Phase 5 when SSE is connected".
3. Loading skeleton for the sheet, error state with Retry.
4. Translated in en, ar and ur-Latn, RTL correct (the sheet opens from the correct side), mobile correct.

Run lint, typecheck and the RTL check. Stop after this step. Report what you built with screenshots (sheet on desktop and mobile, Arabic, a new-order toast).
```
CHECK: click a card, the sheet opens; wait a minute, a new order arrives with a toast and the badge increases.

---

## Step 2.4: Kitchen and Delivery pages  [Section 9.5 /kitchen, /delivery]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Read Section 9.5 of docs/PROJECT_PLAN_v1.1.txt.

STEP 2.4 ONLY: /kitchen and /delivery.

Do exactly this:
1. /kitchen (role chef; owner and manager can open it too): a simple, large-text list of orders that are ACCEPTED or PREPARING showing ONLY order number, items and quantities, and notes. NO customer phone, NO payment info, NO address. Buttons: "Start preparing" (ACCEPTED to PREPARING) and "Mark ready" (PREPARING to READY). Big tap targets (44px).
2. /delivery (role rider; owner and manager can open it too): orders that are READY or OUT_FOR_DELIVERY and of type delivery. Show address, customer name, a tap-to-call phone link, and "Cash to collect: Rs X" ONLY if the payment is COD. Buttons: "Out for delivery" (READY to OUT_FOR_DELIVERY) and "Delivered" (OUT_FOR_DELIVERY to DELIVERED), each confirmed when it is the last step.
3. Both pages use the same fake API, the transition helper, setQueryData cache updates, memoized cards, skeletons, empty states and error states.
4. Make sure that when the order status changes on one page it shows correctly on /orders (same cache).
5. Translated in en, ar and ur-Latn, RTL correct, mobile first (these are used on phones).

Run lint, typecheck and the RTL check. Stop after this step. Report what you built with screenshots (desktop, mobile, Arabic).
```
CHECK: switch role to chef: only the kitchen page works and no phone or payment info is visible. Switch to rider: the cash amount appears only for COD orders.

---

## Step 2.5: Menu page  [Section 9.5 /menu, Section 8.2 aliases, Section 11 menu tables]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Read Section 8.1, 8.2, 9.5 and 11 of docs/PROJECT_PLAN_v1.1.txt.

STEP 2.5 ONLY: the /menu page.

Do exactly this:
1. Roles: owner and manager.
2. Layout: categories list on one side and the items table on the other (stacked on mobile). Items table with image thumbnail, name, price (formatted with Intl), availability Switch, and an actions menu. Server-style pagination (20 per page). Search box.
3. Availability Switch updates the fake API and the cache immediately (optimistic) with a toast, and a rollback with an error toast on failure (simulate one failure rarely for testing, behind a clear dev flag).
4. Item form in a Sheet (create and edit): price, image (placeholder upload that only previews the file), category, availability, and a Tabs control with three tabs: English, العربية, Roman Urdu. Each tab has name, description and aliases (comma-separated tags). Validation with React Hook Form + Zod, translated messages, show which language tabs are missing a translation (the plan says missing translations fall back to English).
5. Category create, rename, reorder (up and down buttons are enough) and delete with a confirm AlertDialog. Category names also have three languages.
6. Loading skeletons, empty state ("Add your first menu item"), error state.
7. Translated UI in en, ar, ur-Latn. RTL correct (the Arabic tab input uses dir="rtl"). Mobile correct.

Run lint, typecheck and the RTL check. Stop after this step. Report what you built with screenshots (desktop, mobile, Arabic, the item form).
```
CHECK: add an item with all three languages, toggle availability, and see it update immediately.

---

## Step 2.6: Analytics page  [Section 9.5 /analytics, DESIGN.md Charts 7.14]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Read the "Charts" part of DESIGN.md and Section 9.5 of docs/PROJECT_PLAN_v1.1.txt. Look at docs/design/design-page-14.png.

STEP 2.6 ONLY: the /analytics page.

Do exactly this:
1. Role: owner only.
2. A date range control (Today, 7 days, 30 days) using the fake analytics API.
3. KPI cards: total sales, number of orders, average order value, COD share.
4. Charts with shadcn Chart (Recharts), loaded with dynamic import, exactly as DESIGN.md: a bar chart of orders per hour (bars #10202D, peak bar gold #C7A667); a line or area chart of sales over time (line midnight, area fill #F4ECDC); a donut chart of COD vs online (midnight and gold, percentage in the center, direct labels, no legend hunting); and a "Top items" list or bar chart.
5. Gridlines #E2E5E9, axis text 12px #5F6C79, tooltip as a white card with a light shadow, no 3D, no gradients, no animation longer than 300 ms. Charts must be readable in Arabic RTL and on mobile.
6. Loading skeletons for the cards and charts, empty state when there is no data, error state with Retry. Numbers use tabular numerals.
7. Translated in en, ar, ur-Latn.

Run lint, typecheck and the RTL check. Stop after this step. Report what you built with screenshots (desktop, mobile, Arabic).
```
CHECK: compare the chart colors with the PDF (page 14). No gradients and no extra colors.

---

## Step 2.7: Team and Settings pages  [Section 9.5 /team, /settings; Section 10.5 alerts]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Read Section 9.5, 10.5 and 11 of docs/PROJECT_PLAN_v1.1.txt.

STEP 2.7 ONLY: /team and /settings.

Do exactly this:
1. /team (owner only): a table of staff (avatar, name, email, role badge, active switch, language) with search and pagination, and an "Add member" Sheet (name, email, role among manager, chef, rider, language, a temporary password field note "set by owner" for now). Edit and deactivate. A confirm AlertDialog for deactivate.
2. /settings (owner only) with Tabs: Hotel (name, timezone, currency, default language, opening hours per day, delivery fee, minimum order, delivery area note), Payments (the hotel's payment account number and instructions shown to customers who choose online payment), Bot texts (welcome and payment messages editable per language with three language tabs and a preview), Notifications (switches: email on every new order, daily summary email, push notifications, sound; the email address).
3. Forms with React Hook Form + Zod, translated validation messages, a save button with a loading spinner state, success toast and an unsaved-changes warning when leaving a changed form.
4. Loading skeletons, error state, empty states where relevant.
5. Translated in en, ar, ur-Latn, RTL correct, mobile correct.

Run lint, typecheck and the RTL check. Stop after this step. Report what you built with screenshots (desktop, mobile, Arabic).
```
CHECK: change a setting, save, reload: it persists until the page is reloaded (fake store only).

---

## Step 2.8: Phase 2 review against the plan  [whole Phase 2]

```
Read AGENTS.md, DESIGN.md, PERFORMANCE.md and DECISIONS.md first. Look at all images in docs/design/.

STEP 2.8 ONLY: review Phase 2 against the plan and fix differences. Do not add new features.

Do exactly this:
1. Produce a table: page (orders, order sheet, kitchen, delivery, menu, analytics, team, settings), requirement from Section 9.5 and DESIGN.md, status (OK or Different).
2. Check PERFORMANCE.md rules: narrow Zustand selectors only, no Context API for shared data, server-style pagination of 20 on lists, React.memo on OrderCard and MenuItemRow, stable keys (id, never index), setQueryData on live updates, dynamic import for charts and the screenshot viewer, no TanStack Virtual unless a list can exceed 200 rows, no memo spraying. Report each rule as OK or Different.
3. Check loading, empty and error states exist on every page, and that the UI uses Skeleton for lists, Spinner inside buttons, Sonner for short results and Alert for persistent problems (DESIGN.md).
4. Check roles: owner, manager, chef, rider see and can open only their pages, and the chef sees no phone, address or payment data.
5. Check all three languages on every page, RTL layout, and mobile width 375px. Search apps/web/src for left/right Tailwind classes and for hard-coded UI strings and fix them.
6. Check contrast and keyboard navigation on the new pages.
7. Fix every Different item. Run lint, typecheck, tests and a production build (pnpm build).

Stop after this step. Report the tables, what you fixed, and what still differs and why.
```
CHECK: **Phase 2 is done** when there are no unexplained "Different" rows and the build passes. Then tell me, and I will write the small-step prompts for Phase 3 (backend).

---

## Progress line (send after each step, in the same conversation)

```
Create or update PROGRESS.md in the project root: add one line for this step with the step number, what was done and today's date. Do not change anything else.
```
