# Installation Guide

## Prerequisites

| Tool | Version | Notes |
| ---- | ------- | ----- |
| Node.js | ≥ 20 | Runtime for all services + frontend build |
| npm | ≥ 10 | Workspaces support |
| PostgreSQL | 16 | Or use the bundled Docker Compose service |
| Docker + Compose | latest | Optional but recommended |

## Option A — Docker Compose (recommended)

```bash
git clone <repo> && cd TZWltd
cp .env.example .env            # edit secrets before any real deployment
docker compose up -d --build
```

This starts PostgreSQL, all six services, the gateway and the frontend. The
schema and reference data are applied automatically (the `database/sql` folder
is mounted into Postgres' init directory). Load sample data:

```bash
docker compose exec gateway sh -c "cd /app && npm run db:seed"
```

| Component | URL |
| --------- | --- |
| Frontend | http://localhost:5173 |
| API Gateway | http://localhost:8080 |
| Aggregated API docs | http://localhost:8080/docs |

## Option B — Local development (no Docker for the apps)

1. **Install dependencies** (root installs all workspaces):

   ```bash
   npm install
   ```

2. **Provision PostgreSQL** and set `DATABASE_URL` in `.env`. Any PostgreSQL 16
   instance works; for example with Docker just for the DB:

   ```bash
   docker run -d --name fems-pg -e POSTGRES_DB=fems -e POSTGRES_USER=fems_app \
     -e POSTGRES_PASSWORD=change_me_in_production -p 5432:5432 postgres:16-alpine
   ```

   > No Docker? The repo includes an optional embedded-PostgreSQL helper
   > (`node scripts/embedded-pg.js`) which downloads platform binaries via npm.
   > Install it with `npm i -D embedded-postgres @embedded-postgres/<platform>`.

3. **Create the schema and seed data:**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run the backend** (all services + gateway):

   ```bash
   npm run dev
   ```

5. **Run the frontend:**

   ```bash
   cd frontend && npm run dev      # http://localhost:5173
   ```

## Verifying the installation

```bash
curl http://localhost:8080/health                      # gateway
curl http://localhost:4001/health                      # a service (db: true when DB is up)
npm test                                                # unit + integration tests
```

Log in at the frontend with `admin@tzw.com` / `Password123!`.

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `db: false` on `/health` | PostgreSQL not reachable; check `DATABASE_URL` |
| `Cannot find module @rollup/...` during frontend build | `npm i -D @rollup/rollup-<platform>` (npm optional-dep bug) |
| `409 CONFLICT` on register/create | duplicate email or serial number |
| `401` after 15 min | access token expired; the SPA auto-refreshes, or re-login |
