# Security

The platform implements defence-in-depth across the gateway, services and data
layer.

## 1. Authentication

- **JWT** access tokens (short-lived, default 15 min) carry `sub`, `email`,
  `role` and are signed with `JWT_ACCESS_SECRET` (issuer/audience constrained).
- **Refresh tokens** (default 7 days) are random, stored **hashed** (SHA-256) in
  `refresh_tokens`, and **rotated** on each refresh (old token revoked).
- **Logout** revokes the presented refresh token server-side.

## 2. Passwords

- Hashed with **bcrypt** (configurable cost, default 12). Plaintext is never
  stored or logged.
- **Strong-password policy** enforced client- and server-side: ≥8 chars with
  lowercase, uppercase, number and special character.
- Password reset uses a hashed, time-limited (1 hour) token; the forgot-password
  endpoint never reveals whether an email exists (anti-enumeration).

## 3. Authorization (RBAC)

- `requireRole(...)` middleware guards routes per the role matrix
  (e.g. user management is ADMIN-only; extinguisher writes are ADMIN/INSPECTOR).
- The frontend additionally hides unauthorized navigation and actions, but the
  server is the source of truth.

## 4. Input validation

- Every request body/query/params is validated with **Zod** schemas; failures
  return `422` with field-level details. This also coerces and normalises input.

## 5. Transport & headers

- **helmet** sets secure headers (HSTS, `X-Content-Type-Options`, frameguard,
  a restrictive CSP, etc.).
- **CORS** is restricted to an explicit origin allow-list (`CORS_ORIGINS`).

## 6. Rate limiting

- A general per-IP limiter protects all routes; a **stricter limiter** guards
  sensitive auth endpoints (login/register/reset) to slow brute-force attempts.

## 7. SQL injection prevention

- All database access uses **parameterised queries** via `pg`. Sort columns are
  whitelisted; user input is never concatenated into SQL.

## 8. XSS & data handling

- The API returns JSON only; React escapes output by default. The CSP and
  `X-Content-Type-Options: nosniff` headers further reduce XSS risk.

## 9. Error handling (no leakage)

- A **centralised error handler** maps typed errors to status codes and returns
  generic messages for unexpected errors (`500`), logging full details
  server-side only. Known PostgreSQL errors (unique/FK violations) map to `409`.

## 10. Secrets management

- All secrets come from **environment variables**; `.env` is git-ignored. In
  `NODE_ENV=production` the app **refuses to start** with the insecure default
  JWT secrets.

## 11. Audit logging

- Security-relevant actions (login, logout, registration, user updates/deletes,
  extinguisher create/update/delete, inspection scheduling/cancellation,
  maintenance logging, report exports) are recorded in `audit_logs` with the
  acting user, action, entity, entity id, timestamp, metadata and IP. Audit
  failures never break the primary request.

## 12. Structured logging with redaction

- Logs are JSON with per-request correlation ids; sensitive fields
  (`authorization`, `password`, tokens) are automatically redacted.
