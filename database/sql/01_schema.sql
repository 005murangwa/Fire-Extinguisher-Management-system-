-- ============================================================================
-- TZW FEMS - Relational Schema (PostgreSQL)
-- ----------------------------------------------------------------------------
-- This script creates the complete relational schema for the Fire Extinguisher
-- Management System: tables, constraints, relationships and indexes.
--
-- Design notes:
--   * UUID primary keys (gen_random_uuid) for globally-unique, non-guessable ids
--     suitable for a distributed microservices environment.
--   * CHECK constraints enforce the controlled vocabularies (roles, types,...).
--   * Foreign keys document and enforce cross-entity relationships.
--   * Indexes back the most common search/filter/sort access patterns.
-- ============================================================================

-- pgcrypto provides gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- ROLES
-- Lookup table for the three application roles. Kept as a table (rather than a
-- bare enum) so roles can carry a description and be referenced by FK.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id          SMALLINT PRIMARY KEY,
    name        VARCHAR(20)  NOT NULL UNIQUE
                CHECK (name IN ('ADMIN', 'INSPECTOR', 'USER')),
    description VARCHAR(255) NOT NULL
);

-- ----------------------------------------------------------------------------
-- USERS
-- Application accounts. The password is stored as a bcrypt hash only.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(80)  NOT NULL,
    last_name       VARCHAR(80)  NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role_id         SMALLINT     NOT NULL REFERENCES roles(id),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    -- Password reset support (forgot/reset password flow).
    reset_token_hash VARCHAR(255),
    reset_expires_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- ----------------------------------------------------------------------------
-- REFRESH_TOKENS
-- Server-side record of issued refresh tokens enabling logout/rotation.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- FIRE_EXTINGUISHERS
-- The core managed asset.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fire_extinguishers (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number     VARCHAR(60)  NOT NULL UNIQUE,
    location          VARCHAR(255) NOT NULL,
    type              VARCHAR(20)  NOT NULL
                      CHECK (type IN ('Water', 'CO2', 'Foam', 'Dry Chemical')),
    size              VARCHAR(10)  NOT NULL
                      CHECK (size IN ('2.5 lbs', '5 lbs', '9 lbs', '12 lbs')),
    installation_date DATE         NOT NULL,
    expiry_date       DATE         NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'Active'
                      CHECK (status IN ('Active', 'Expired', 'Maintenance', 'Decommissioned')),
    created_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- Business rule: an extinguisher must expire after it is installed.
    CONSTRAINT chk_expiry_after_install CHECK (expiry_date > installation_date)
);

-- ----------------------------------------------------------------------------
-- INSPECTIONS
-- Scheduled / completed inspections of an extinguisher by an inspector.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extinguisher_id     UUID NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    inspector_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    scheduled_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    inspection_date     DATE NOT NULL,
    inspection_time     TIME NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
                        CHECK (status IN ('Scheduled', 'Completed', 'Overdue', 'Cancelled')),
    result              VARCHAR(20)
                        CHECK (result IN ('Pass', 'Fail', 'Needs Maintenance')),
    notes               TEXT,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Prevent two active inspections for the same asset at the same slot.
    CONSTRAINT uq_inspection_slot UNIQUE (extinguisher_id, inspection_date, inspection_time)
);

-- ----------------------------------------------------------------------------
-- MAINTENANCE_LOGS
-- Full maintenance history per extinguisher.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extinguisher_id    UUID NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    inspection_id      UUID REFERENCES inspections(id) ON DELETE SET NULL,
    performed_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    action_taken       VARCHAR(255) NOT NULL,
    maintenance_date   DATE NOT NULL,
    issues_identified  TEXT,
    notes              TEXT,
    recommendations    TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- Notification history for the notification centre.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(40) NOT NULL
                CHECK (type IN ('INSPECTION_SCHEDULED', 'INSPECTION_UPCOMING',
                                'INSPECTION_OVERDUE', 'EXTINGUISHER_EXPIRING',
                                'MAINTENANCE_REMINDER', 'REQUEST_SUBMITTED',
                                'REQUEST_APPROVED', 'REQUEST_DENIED')),
    title       VARCHAR(160) NOT NULL,
    message     TEXT NOT NULL,
    entity      VARCHAR(40),
    entity_id   UUID,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- AUDIT_LOGS
-- Immutable record of security-relevant actions.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(40)  NOT NULL,
    entity      VARCHAR(40)  NOT NULL,
    entity_id   UUID,
    metadata    JSONB,
    ip_address  VARCHAR(64),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES - tuned for the documented search / filter / sort access patterns.
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_role            ON users (role_id);
CREATE INDEX IF NOT EXISTS idx_users_email_lower      ON users (lower(email));

CREATE INDEX IF NOT EXISTS idx_ext_status            ON fire_extinguishers (status);
CREATE INDEX IF NOT EXISTS idx_ext_type              ON fire_extinguishers (type);
CREATE INDEX IF NOT EXISTS idx_ext_location          ON fire_extinguishers (location);
CREATE INDEX IF NOT EXISTS idx_ext_expiry            ON fire_extinguishers (expiry_date);
CREATE INDEX IF NOT EXISTS idx_ext_serial_lower      ON fire_extinguishers (lower(serial_number));

CREATE INDEX IF NOT EXISTS idx_insp_extinguisher     ON inspections (extinguisher_id);
CREATE INDEX IF NOT EXISTS idx_insp_inspector        ON inspections (inspector_id);
CREATE INDEX IF NOT EXISTS idx_insp_status           ON inspections (status);
CREATE INDEX IF NOT EXISTS idx_insp_date             ON inspections (inspection_date);

CREATE INDEX IF NOT EXISTS idx_maint_extinguisher    ON maintenance_logs (extinguisher_id);
CREATE INDEX IF NOT EXISTS idx_maint_date            ON maintenance_logs (maintenance_date);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread     ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_created         ON notifications (created_at);

CREATE INDEX IF NOT EXISTS idx_audit_user            ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity          ON audit_logs (entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created         ON audit_logs (created_at);

-- ============================================================================
-- TRIGGER - keep updated_at fresh on row updates.
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ext_updated ON fire_extinguishers;
CREATE TRIGGER trg_ext_updated BEFORE UPDATE ON fire_extinguishers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_insp_updated ON inspections;
CREATE TRIGGER trg_insp_updated BEFORE UPDATE ON inspections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
