# PERFORMANCE.md: Performance and scalability rules

Source: `docs/PROJECT_PLAN_v1.1.pdf`, Sections 9.2, 9.3, 10.4, 10.6, 11.1, 11.2. Follow these exactly. Do not add extra optimization that is not listed here.

## Frontend: state without prop drilling (Section 9.2)
| Kind of data | Where it lives | Examples |
|---|---|---|
| Server data | TanStack Query, shared by query key | Orders, menu, team, settings |
| Global UI state | Zustand store | Sidebar open or collapsed, selected order, filters, sound on or off, language |
| Auth state | Zustand (in memory) | Access token, user, role, restaurant |
| Local state | useState | A form input value, a dropdown open state |

- Do not use Context API for shared data.
- Components read ONLY the slice they need with a narrow selector, never the whole store:
  `const soundOn = useUI((s) => s.soundOn);`

## Frontend: rendering and long lists (Section 9.3)
| Technique | Rule | Where |
|---|---|---|
| Narrow selectors | A component re-renders only when its own slice changes | Every Zustand use |
| Server-side pagination | Server sends 20 rows at a time. This is the FIRST choice for every list | All lists |
| Infinite scroll or "Load more" | Fetch the next page on demand | Order history, messages |
| TanStack Virtual | Only visible rows exist in the page. Use ONLY if a list truly reaches 200+ rows | Very long lists only |
| React.memo | Skip re-render if props did not change | OrderCard, MenuItemRow |
| Stable keys | Use `order.id`, never the array index | All lists |
| Query cache updates | On a live event update the single order with `setQueryData` instead of refetching the list | SSE events |
| Dynamic import | Load heavy parts when needed | Charts, screenshot viewer |
| Server Components | Default in Next.js. Add `'use client'` only when state, effects or events are needed | Layouts and static parts |

Narrow selectors decide which components re-render. Pagination and virtualization decide how many rows exist in the page. They are different tools.
Measure with the React DevTools Profiler before adding memo anywhere else. Do not put memo, useMemo or useCallback everywhere without a measured reason.

Other frontend rules:
- Components do one job. Data comes from hooks, presentational components only display props.
- Fonts self-hosted with `next/font`.
- Respect `prefers-reduced-motion`.

## Backend: scalability (Sections 4, 10.6)
- Stateless servers: sessions and bot state live in the database or Redis, never in server memory.
- Light webhook: verify signature, save the message (unique `wa_message_id`), queue a BullMQ job, return 200 immediately. All real work runs in the worker process.
- Cache hotel settings and the menu in Redis.
- Use the connection pooler (Neon or Supabase pooler, or PgBouncer) for database connections.
- Layers: routes, controllers (request and response only), services (business logic), repositories (Prisma, always filtered by `restaurant_id`).
- Retries for background jobs (BullMQ), and BullMQ limiter to stay within Meta throughput when sending.

## Rate limiting (Section 10.4)
| Where | Limit | Key |
|---|---|---|
| POST /auth/login | 5 per minute | IP + email |
| Dashboard APIs | 100 per minute | user id |
| Webhook | high limit, trust the Meta signature | IP |
| Bot, each customer | about 20 messages per minute, then a temporary block | phone + restaurant |
| WhatsApp sending | BullMQ limiter | queue |
Counters live in Redis so limits work across several servers. Start with `express-rate-limit`.

## Database (Sections 11.1, 11.2)
Indexes (create exactly these at the start):
```sql
CREATE INDEX orders_rest_status_created ON orders (restaurant_id, status, created_at DESC);
CREATE INDEX orders_rest_created        ON orders (restaurant_id, created_at DESC);
CREATE UNIQUE INDEX customers_rest_phone ON customers (restaurant_id, phone);
CREATE UNIQUE INDEX messages_wa_id       ON messages (wa_message_id);
CREATE INDEX messages_rest_created       ON messages (restaurant_id, created_at DESC);
CREATE INDEX menu_items_rest_cat         ON menu_items (restaurant_id, category_id);
```
- Money as integers (minor units). Phone numbers in E.164.
- Retention: delete or archive raw messages after about 90 days. Keep orders much longer.
- Partitioning: only when the messages table reaches many millions of rows. NOT at the start.
- Backups: daily `pg_dump` to cloud storage, and test a restore.
- Check the main queries with `EXPLAIN` before launch.
