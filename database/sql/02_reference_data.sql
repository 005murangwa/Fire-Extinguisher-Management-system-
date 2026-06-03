-- ============================================================================
-- TZW FEMS - Reference Data
-- ----------------------------------------------------------------------------
-- Static lookup data that the application depends on. Safe to run repeatedly
-- (idempotent via ON CONFLICT).
-- ============================================================================

INSERT INTO roles (id, name, description) VALUES
    (1, 'ADMIN',     'Full access: manage users, settings, records and reports'),
    (2, 'INSPECTOR', 'Conduct inspections, schedule and log maintenance'),
    (3, 'USER',      'View extinguisher status, schedule inspections, view history')
ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description;
