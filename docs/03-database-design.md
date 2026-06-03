# Database Design

The system uses **PostgreSQL 16**. The schema is defined in
[`database/sql/01_schema.sql`](../database/sql/01_schema.sql) with reference data
in [`02_reference_data.sql`](../database/sql/02_reference_data.sql).

## 1. Entity-Relationship Diagram

```mermaid
erDiagram
    ROLES ||--o{ USERS : "has"
    USERS ||--o{ REFRESH_TOKENS : "owns"
    USERS ||--o{ FIRE_EXTINGUISHERS : "creates"
    USERS ||--o{ INSPECTIONS : "inspects / schedules"
    USERS ||--o{ MAINTENANCE_LOGS : "performs"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ AUDIT_LOGS : "acts"
    FIRE_EXTINGUISHERS ||--o{ INSPECTIONS : "is inspected"
    FIRE_EXTINGUISHERS ||--o{ MAINTENANCE_LOGS : "is maintained"
    INSPECTIONS ||--o{ MAINTENANCE_LOGS : "may trigger"

    ROLES {
      smallint id PK
      varchar  name UK
      varchar  description
    }
    USERS {
      uuid     id PK
      varchar  first_name
      varchar  last_name
      varchar  email UK
      varchar  password_hash
      smallint role_id FK
      boolean  is_active
      timestamptz last_login_at
      varchar  reset_token_hash
      timestamptz reset_expires_at
      timestamptz created_at
      timestamptz updated_at
    }
    REFRESH_TOKENS {
      uuid     id PK
      uuid     user_id FK
      varchar  token_hash
      timestamptz expires_at
      timestamptz revoked_at
    }
    FIRE_EXTINGUISHERS {
      uuid     id PK
      varchar  serial_number UK
      varchar  location
      varchar  type
      varchar  size
      date     installation_date
      date     expiry_date
      varchar  status
      uuid     created_by FK
      timestamptz created_at
      timestamptz updated_at
    }
    INSPECTIONS {
      uuid     id PK
      uuid     extinguisher_id FK
      uuid     inspector_id FK
      uuid     scheduled_by FK
      date     inspection_date
      time     inspection_time
      varchar  status
      varchar  result
      text     notes
      timestamptz completed_at
    }
    MAINTENANCE_LOGS {
      uuid     id PK
      uuid     extinguisher_id FK
      uuid     inspection_id FK
      uuid     performed_by FK
      varchar  action_taken
      date     maintenance_date
      text     issues_identified
      text     notes
      text     recommendations
    }
    NOTIFICATIONS {
      uuid     id PK
      uuid     user_id FK
      varchar  type
      varchar  title
      text     message
      varchar  entity
      uuid     entity_id
      boolean  is_read
      timestamptz created_at
    }
    AUDIT_LOGS {
      uuid     id PK
      uuid     user_id FK
      varchar  action
      varchar  entity
      uuid     entity_id
      jsonb    metadata
      varchar  ip_address
      timestamptz created_at
    }
```

## 2. Tables & relationships

| Table | Purpose | Key relationships |
| ----- | ------- | ----------------- |
| `roles` | RBAC role lookup (ADMIN/INSPECTOR/USER) | `users.role_id → roles.id` |
| `users` | Accounts (bcrypt password hash only) | parent of most tables |
| `refresh_tokens` | Issued refresh tokens (hashed) for logout/rotation | `→ users` (CASCADE) |
| `fire_extinguishers` | Core managed asset | `created_by → users` |
| `inspections` | Scheduled/completed inspections | `→ fire_extinguishers` (CASCADE), `→ users` |
| `maintenance_logs` | Maintenance history | `→ fire_extinguishers` (CASCADE), `→ inspections`, `→ users` |
| `notifications` | Notification centre history | `→ users` (CASCADE) |
| `audit_logs` | Security-relevant action trail | `→ users` (SET NULL) |

## 3. Constraints

- **Primary keys:** UUID (`gen_random_uuid()`) on all entities; `SMALLINT` on roles.
- **Unique:** `users.email`, `fire_extinguishers.serial_number`,
  `roles.name`, and `inspections(extinguisher_id, inspection_date,
  inspection_time)` to prevent duplicate scheduling.
- **Check constraints:** controlled vocabularies for `roles.name`,
  extinguisher `type`/`size`/`status`, inspection `status`/`result`,
  notification `type`; an email-format check; and
  **`expiry_date > installation_date`** for extinguishers.
- **Foreign keys:** enforce referential integrity with appropriate
  `ON DELETE` behaviour (`CASCADE` for ownership, `SET NULL` for audit/actor
  references so history survives user deletion).

## 4. Indexes

Indexes back the documented search/filter/sort access patterns:

- `users`: `role_id`, `lower(email)`
- `fire_extinguishers`: `status`, `type`, `location`, `expiry_date`,
  `lower(serial_number)`
- `inspections`: `extinguisher_id`, `inspector_id`, `status`, `inspection_date`
- `maintenance_logs`: `extinguisher_id`, `maintenance_date`
- `notifications`: `(user_id, is_read)`, `created_at`
- `audit_logs`: `user_id`, `(entity, entity_id)`, `created_at`

## 5. Triggers

A `set_updated_at()` trigger keeps `updated_at` current on row updates for
`users`, `fire_extinguishers` and `inspections`.

## 6. Relational schema (DDL)

The complete, runnable DDL is in
[`database/sql/01_schema.sql`](../database/sql/01_schema.sql). Apply it with:

```bash
npm run db:migrate   # runs every file in database/sql in order
npm run db:seed      # loads realistic sample data
```

## 7. Backups

Logical backups use `pg_dump` (custom compressed format):

```bash
./database/scripts/backup.sh           # creates database/backups/fems_<timestamp>.dump
./database/scripts/restore.sh <file>   # restores a backup
```

The backup script keeps the 14 most recent backups and reads all connection
settings from environment variables.
