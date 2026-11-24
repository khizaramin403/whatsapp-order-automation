# WhatsApp Order Automation

A multi-tenant WhatsApp ordering and operational management platform for restaurants and hotels. Customers browse menus, build carts, choose fulfillment (delivery or dine-in), and place orders through WhatsApp in English, Arabic (RTL), or Roman Urdu, while restaurant staff manage live orders across role-based dashboards (Owner, Manager, Chef, Rider).

---

## Prerequisites (Windows)

Make sure the following tools are installed:
- **Node.js**: v20+ LTS or v24 LTS (`node -v`)
- **pnpm**: v10+ or v12+ (`pnpm -v`)
- **Docker Desktop**: Running with Linux containers (`docker --version`)
- **Git**: (`git --version`)

---

## Getting Started (Step-by-Step for Windows)

### 1. Install Dependencies
Open PowerShell in the project root directory and run:
```powershell
pnpm install
```

### 2. Copy Environment Files
Create local `.env` files from their respective examples:
```powershell
# Root Docker configuration
Copy-Item .env.example .env

# Web dashboard configuration
Copy-Item apps/web/.env.example apps/web/.env.local

# API backend configuration
Copy-Item apps/api/.env.example apps/api/.env
```

### 3. Start Local Databases (PostgreSQL & Redis)
Ensure Docker Desktop is running, then start the containers:
```powershell
pnpm db:up
```
Verify that both containers are healthy:
```powershell
docker compose ps
```

### 4. Run Initial Database Migrations & Seed
Apply the Prisma migration to PostgreSQL:
```powershell
pnpm --filter @app/api prisma:migrate
```

Seed the database with the demo hotel, staff logins, menu items, and sample orders:
```powershell
pnpm --filter @app/api prisma:seed
```

### 5. Start Development Servers
Run both the Web app and API backend together:
```powershell
pnpm dev
```
Or start them individually in separate PowerShell windows:
- **Web Dashboard**: `pnpm dev:web` (or `cd apps/web && pnpm dev`)
- **API Backend**: `pnpm dev:api` (or `cd apps/api && pnpm dev`)

---

## Development logins

Development accounts created by the seed script (`pnpm --filter @app/api prisma:seed`). All accounts use passwords hashed with bcrypt (cost 10).

| Role | Name | Email | Password | Scope |
|---|---|---|---|---|
| `super_admin` | Super Administrator | `superadmin@demo.local` | `Password123!` | Global (no restaurant) |
| `owner` | Tariq Mahmood | `owner@demo.local` | `Password123!` | Grand Continental Hotel |
| `manager` | Ayesha Khan | `manager@demo.local` | `Password123!` | Grand Continental Hotel |
| `chef` | Bilal Ahmed | `chef@demo.local` | `Password123!` | Grand Continental Hotel |
| `rider` | Usman Ali | `rider@demo.local` | `Password123!` | Grand Continental Hotel |

---

## Application URLs

| Service | URL | Purpose |
|---|---|---|
| **Web Dashboard** | [http://localhost:3000](http://localhost:3000) | Operational frontend (Next.js) |
| **API Backend** | [http://localhost:4000/health](http://localhost:4000/health) | Health check endpoint (Express) |
| **Prisma Studio** | `pnpm --filter @app/api prisma:studio` | Database visual GUI (port 5555) |

---

## Available Scripts

- `pnpm dev` — Run web and api in parallel with colored prefixes
- `pnpm dev:web` — Run web app alone on port 3000
- `pnpm dev:api` — Run api backend alone on port 4000
- `pnpm build` — Build all workspace packages
- `pnpm lint` — Lint all packages with ESLint
- `pnpm typecheck` — Run TypeScript typecheck across all packages
- `pnpm test` — Run automated test suite
- `pnpm db:up` — Start Docker Postgres and Redis in background
- `pnpm db:down` — Stop Docker Postgres and Redis
