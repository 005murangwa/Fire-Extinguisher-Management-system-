/**
 * @file service.js
 * @module auth-service/service
 *
 * Purpose:
 *   Business logic for authentication & account management, independent of
 *   Express. Controllers translate HTTP <-> these functions.
 *
 * Responsibilities:
 *   - Registration, login, refresh, logout.
 *   - Profile read/update, password change, forgot/reset password.
 *   - Issue/rotate JWT access + opaque refresh tokens (stored hashed).
 */

import crypto from 'node:crypto';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@fems/shared/jwt.js';
import { hashPassword, verifyPassword } from '@fems/shared/password.js';
import { config } from '@fems/shared/config.js';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '@fems/shared/errors.js';
import { sendMail } from '@fems/shared/mail.js';
import * as repo from './userRepository.js';
import * as otpRepo from './otpRepository.js';

/**
 * Hash a token with SHA-256 for at-rest storage (refresh/reset tokens).
 * @param {string} token - Raw token.
 * @returns {string} Hex digest.
 */
const sha256 = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Issue a fresh access + refresh token pair for a user and persist the refresh
 * token's hash so it can later be validated/revoked.
 *
 * @param {{id:string,email:string,role:string}} user - User identity.
 * @returns {Promise<{accessToken:string,refreshToken:string,expiresIn:number}>}
 */
async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const expiresAt = new Date(Date.now() + config.jwt.refreshTtl * 1000);
  await repo.storeRefreshToken(user.id, sha256(refreshToken), expiresAt);
  return { accessToken, refreshToken, expiresIn: config.jwt.accessTtl };
}

/**
 * Register a new account (always with the USER role).
 *
 * @param {{firstName:string,lastName:string,email:string,password:string}} input
 * @returns {Promise<{user:object, tokens:object}>} Created user + tokens.
 * @throws {ConflictError} When the email is already registered.
 */
/** Step 1: email OTP before account is created. */
export async function sendRegistrationOtp(input) {
  if (await repo.emailExists(input.email)) {
    throw new ConflictError('An account with this email already exists');
  }
  const otp = String(crypto.randomInt(100000, 999999));
  await otpRepo.saveOtp(input.email, otp, {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: input.password,
  });
  await sendMail({
    to: input.email,
    subject: 'TZW FEMS — Verify your email',
    text: `Your verification code is: ${otp}\n\nIt expires in 15 minutes.`,
  });
  return { message: 'Verification code sent to your email' };
}

/** Step 2: verify OTP and create the account. */
export async function register(input) {
  if (await repo.emailExists(input.email)) {
    throw new ConflictError('An account with this email already exists');
  }
  const payload = await otpRepo.consumeOtp(input.email, input.otp);
  if (!payload) {
    throw new ValidationError('Invalid or expired verification code', [
      { field: 'body.otp', message: 'Invalid or expired verification code' },
    ]);
  }
  const passwordHash = await hashPassword(input.password);
  const user = await repo.createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
    emailVerified: true,
  });
  const tokens = await issueTokens(user);
  return { user, tokens };
}

/**
 * Authenticate a user with email + password.
 *
 * @param {{email:string,password:string}} input - Credentials.
 * @returns {Promise<{user:object, tokens:object}>} User + tokens.
 * @throws {UnauthorizedError} On invalid credentials or inactive account.
 */
export async function login(input) {
  const found = await repo.findByEmailWithHash(input.email);
  // Use a uniform error to avoid leaking which part was wrong (user enumeration).
  if (!found) throw new UnauthorizedError('Invalid email or password');
  if (!found.isActive) throw new UnauthorizedError('Account is disabled');

  const valid = await verifyPassword(input.password, found.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid email or password');

  await repo.touchLogin(found.id);
  const user = await repo.findPublicById(found.id);
  const tokens = await issueTokens(user);
  return { user, tokens, isFirstLogin: !!user?.isFirstLogin };
}

/**
 * Exchange a valid refresh token for a new token pair (rotation).
 *
 * @param {string} refreshToken - The opaque refresh token.
 * @returns {Promise<{tokens:object}>} New token pair.
 * @throws {UnauthorizedError} When the token is invalid/revoked/expired.
 */
export async function refresh(refreshToken) {
  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  const tokenHash = sha256(refreshToken);
  const record = await repo.findActiveRefreshToken(tokenHash);
  if (!record) throw new UnauthorizedError('Refresh token is not recognised');

  // Rotate: revoke the presented token and issue a new pair.
  await repo.revokeRefreshToken(tokenHash);
  const user = await repo.findPublicById(record.userId);
  if (!user) throw new UnauthorizedError('User no longer exists');
  const tokens = await issueTokens(user);
  return { user, tokens };
}

/**
 * Revoke a refresh token (logout).
 *
 * @param {string} refreshToken - The token to revoke.
 * @returns {Promise<void>}
 */
export async function logout(refreshToken) {
  await repo.revokeRefreshToken(sha256(refreshToken));
}

/**
 * Get a user's public profile.
 *
 * @param {string} userId - User id.
 * @returns {Promise<object>} Public user.
 * @throws {NotFoundError} When missing.
 */
export async function getProfile(userId) {
  const user = await repo.findPublicById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
}

/**
 * Update profile fields, guarding against email collisions.
 *
 * @param {string} userId - User id.
 * @param {{firstName?:string,lastName?:string,email?:string}} fields - Partial.
 * @returns {Promise<object>} Updated user.
 */
export async function updateProfile(userId, fields) {
  if (fields.email) {
    const existing = await repo.findByEmailWithHash(fields.email);
    if (existing && existing.id !== userId) {
      throw new ConflictError('Email is already in use');
    }
  }
  return repo.updateProfile(userId, fields);
}

/**
 * Change a user's password after verifying the current one.
 *
 * @param {string} userId - User id.
 * @param {string} currentPassword - Existing password.
 * @param {string} newPassword - New password (already strength-validated).
 * @returns {Promise<void>}
 * @throws {ValidationError} When the current password is wrong.
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const hash = await repo.getPasswordHash(userId);
  if (!hash) throw new NotFoundError('User not found');
  const valid = await verifyPassword(currentPassword, hash);
  if (!valid) {
    throw new ValidationError('Current password is incorrect', [
      { field: 'body.currentPassword', message: 'Current password is incorrect' },
    ]);
  }
  await repo.updatePassword(userId, await hashPassword(newPassword));
  await repo.clearFirstLogin(userId);
}

/**
 * Begin a password-reset flow. To avoid user enumeration the function returns a
 * token only in non-production for demonstration; in production it would be
 * emailed. Always resolves regardless of whether the email exists.
 *
 * @param {string} email - Account email.
 * @returns {Promise<{resetToken?:string}>} Reset token (dev only).
 */
export async function forgotPassword(email) {
  const user = await repo.findByEmailWithHash(email);
  if (!user) return {}; // Do not reveal whether the email exists.

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await repo.setResetToken(user.id, sha256(resetToken), expiresAt);

  const resetUrl = `${config.app.publicUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
  await sendMail({
    to: email,
    subject: 'TZW FEMS — Reset your password',
    text: `Use this link to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
  });

  // Dev convenience only — never expose the token in production responses.
  return config.isProd ? {} : { resetToken, resetUrl };
}

/**
 * Complete a password reset using a valid token.
 *
 * @param {string} token - Raw reset token.
 * @param {string} newPassword - New password.
 * @returns {Promise<void>}
 * @throws {ValidationError} When the token is invalid/expired.
 */
export async function resetPassword(token, newPassword) {
  const user = await repo.findByResetToken(sha256(token));
  if (!user) {
    throw new ValidationError('Reset token is invalid or has expired', [
      { field: 'body.token', message: 'Invalid or expired token' },
    ]);
  }
  await repo.updatePassword(user.id, await hashPassword(newPassword));
  await repo.clearResetToken(user.id);
  const publicUser = await repo.findPublicById(user.id);
  const tokens = await issueTokens(publicUser);
  return { user: publicUser, tokens };
}
