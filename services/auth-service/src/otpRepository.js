/**
 * Registration OTP persistence.
 */

import crypto from 'node:crypto';
import { query } from '@fems/shared/db.js';

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

export async function saveOtp(email, otp, payload, ttlMinutes = 15) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  await query(
    `UPDATE registration_otps SET consumed_at = now()
      WHERE email = $1 AND consumed_at IS NULL`,
    [email]
  );
  await query(
    `INSERT INTO registration_otps (email, otp_hash, payload, expires_at)
     VALUES ($1,$2,$3,$4)`,
    [email, sha256(otp), JSON.stringify(payload), expiresAt]
  );
}

export async function consumeOtp(email, otp) {
  const { rows } = await query(
    `SELECT id, payload FROM registration_otps
      WHERE email = $1 AND otp_hash = $2 AND consumed_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC LIMIT 1`,
    [email, sha256(otp)]
  );
  if (!rows[0]) return null;
  await query('UPDATE registration_otps SET consumed_at = now() WHERE id = $1', [rows[0].id]);
  return rows[0].payload;
}
