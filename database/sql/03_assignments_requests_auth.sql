-- Assignments, extinguisher requests, registration OTP, and invite fields.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE fire_extinguishers
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS extinguisher_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    extinguisher_id UUID NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    location_details TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
    denial_reason   TEXT,
    approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    extinguisher_id UUID NOT NULL REFERENCES fire_extinguishers(id) ON DELETE CASCADE,
    assigned_by     UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    returned_at     TIMESTAMPTZ,
    return_reason   TEXT
);

CREATE TABLE IF NOT EXISTS registration_otps (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL,
    otp_hash    VARCHAR(255) NOT NULL,
    payload     JSONB NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extinguishers_assigned_to ON fire_extinguishers(assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_status ON extinguisher_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_requester ON extinguisher_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_registration_otps_email ON registration_otps(email);
