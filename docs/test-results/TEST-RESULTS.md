# Test Results

_Generated: 2026-06-03T08:59:42.754Z_

## Summary

| Metric | Value |
| ------ | ----- |
| Total tests | 36 |
| Passed | 27 |
| Failed | 0 |
| Skipped (DB-dependent integration) | 9 |

## Test Categories

- **Unit tests** (no database): password policy & hashing, JWT signing/verification,
  request validation schemas, centralised error mapping, RBAC + authentication
  middleware, CSV/PDF export and pagination parsing.
- **Integration / API tests** (require PostgreSQL): registration, login,
  duplicate-email conflict, profile authorization, RBAC on writes, unique-serial
  conflict and the expiry-after-installation rule. These are skipped when no
  database is reachable.

All executed tests passed.

