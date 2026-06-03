# Folder Structure

```
TZWltd/
├── package.json                 # npm workspaces root + scripts
├── docker-compose.yml           # db + 6 services + gateway + frontend
├── Dockerfile                   # generic image for any Node service (SERVICE arg)
├── .env.example                 # sample configuration (copy to .env)
│
├── packages/
│   └── shared/                  # @fems/shared — cross-cutting library
│       └── src/
│           ├── config.js         # validated env config
│           ├── logger.js         # structured logging (+ redaction)
│           ├── db.js             # pooled, parameterised PostgreSQL access
│           ├── errors.js         # typed AppError hierarchy
│           ├── http.js           # response envelopes + asyncHandler
│           ├── jwt.js            # access/refresh token sign/verify
│           ├── password.js       # bcrypt + strength policy
│           ├── audit.js          # audit-log writer
│           ├── pagination.js     # safe pagination/sort parsing
│           ├── constants.js      # roles + domain enums
│           ├── createApp.js      # hardened Express app factory
│           ├── index.js          # barrel exports
│           └── middleware/
│               ├── auth.js        # JWT authentication
│               ├── rbac.js        # role-based access control
│               ├── validate.js    # Zod request validation
│               ├── security.js    # helmet/CORS/rate-limit
│               └── errorHandler.js# centralised error + 404 handling
│
├── services/
│   ├── auth-service/            # :4001  /api/v1/auth
│   ├── user-service/            # :4002  /api/v1/users, /roles
│   ├── extinguisher-service/    # :4003  /api/v1/extinguishers
│   ├── inspection-service/      # :4004  /api/v1/inspections, /maintenance, /timelines
│   ├── notification-service/    # :4005  /api/v1/notifications
│   └── reporting-service/       # :4006  /api/v1/reports, /audit-logs
│        └── src/
│            ├── server.js        # bootstrap (createApp + startServer)
│            ├── routes.js        # route wiring (auth + RBAC + validation)
│            ├── controller.js    # HTTP controllers (thin)
│            ├── service.js       # business logic (where applicable)
│            ├── repository.js    # parameterised SQL data access
│            ├── schemas.js       # Zod DTOs
│        └── openapi.yaml         # OpenAPI 3.0 spec (served at /docs)
│
├── gateway/
│   └── src/server.js            # routing, security, aggregated Swagger
│
├── frontend/                    # React + Vite + Tailwind + Tremor SPA
│   ├── vite.config.js
│   ├── tailwind.config.js       # includes Tremor design tokens
│   ├── src/
│   │   ├── main.jsx              # providers + router + toaster
│   │   ├── App.jsx               # routes (public + protected shell)
│   │   ├── lib/                  # api client, formatters
│   │   ├── context/              # AuthContext, ThemeContext (dark mode)
│   │   ├── components/           # Layout, Sidebar, Topbar, DataTable, KpiCard, …
│   │   └── pages/                # Login, Register, Dashboard, Extinguishers, …
│   ├── Dockerfile               # Vite build → nginx
│   └── nginx.conf
│
├── database/
│   ├── sql/
│   │   ├── 01_schema.sql         # tables, constraints, indexes, triggers
│   │   └── 02_reference_data.sql # roles
│   ├── scripts/
│   │   ├── migrate.js            # apply SQL files in order
│   │   ├── seed.js               # realistic sample data
│   │   ├── backup.sh             # pg_dump backup (+ retention)
│   │   └── restore.sh            # pg_restore
│   └── backups/                 # generated backups (git-ignored)
│
├── tests/
│   ├── unit/                    # DB-free: password, jwt, validation, errors, rbac, exporter, pagination
│   ├── integration/             # DB-backed API/auth/RBAC tests (skip without DB)
│   ├── helpers/                 # app harness (listen + fetch)
│   └── run-report.js            # generates docs/test-results/TEST-RESULTS.md
│
└── docs/                        # this documentation set
    ├── 01-system-architecture.md
    ├── 02-microservices-design.md
    ├── 03-database-design.md
    ├── 04-api-guide.md
    ├── 05-installation-guide.md
    ├── 06-deployment-guide.md
    ├── 07-user-manual.md
    ├── 08-security.md
    ├── 09-folder-structure.md
    └── test-results/TEST-RESULTS.md
```

## Architectural layering within each service

```
HTTP → routes → controller → service → repository → PostgreSQL
                  (envelope)   (rules)   (SQL)
```

- **routes** apply authentication, RBAC and validation middleware.
- **controllers** are thin: call the service/repository, write audit logs and
  return the standard envelope.
- **services** hold business logic (notably the Auth Service).
- **repositories** own all SQL (parameterised), isolating persistence.

This clean separation, the shared library and DTO-based validation satisfy the
project's code-quality requirements (single responsibility, no duplication,
centralised error handling and structured logging).
```
