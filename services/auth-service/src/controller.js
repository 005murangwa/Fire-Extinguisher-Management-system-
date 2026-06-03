/**
 * @file controller.js
 * @module auth-service/controller
 *
 * Purpose:
 *   HTTP controllers that adapt requests/responses to the service layer and
 *   write audit log entries for security-relevant actions.
 *
 * Each handler: validates is done by middleware; here we invoke the service,
 * write audit logs and return the standard response envelope.
 */

import { ok, created, noContent } from '@fems/shared/http.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AUDIT_ACTIONS } from '@fems/shared/constants.js';
import * as svc from './service.js';
import {
  setAuthCookies,
  clearAuthCookies,
  requireRefreshToken,
  readRefreshToken,
} from './middleware/auth.js';

/**
 * Attach token pair to JSON body and Set-Cookie headers.
 * @param {import('express').Response} res - Response.
 * @param {Function} responder - ok/created.
 * @param {object} payload - User + tokens + extras.
 * @returns {import('express').Response}
 */
function respondWithTokens(res, responder, payload) {
  const { user, tokens, ...rest } = payload;
  if (tokens) setAuthCookies(res, tokens);
  return responder(res, { user, ...tokens, ...rest });
}

/** POST /send-registration-otp - email verification code. */
export async function sendRegistrationOtp(req, res) {
  const result = await svc.sendRegistrationOtp(req.body);
  return ok(res, result);
}

/** POST /register - verify OTP, create account, return tokens. */
export async function register(req, res) {
  const { user, tokens } = await svc.register(req.body);
  await writeAudit({ userId: user.id, action: AUDIT_ACTIONS.REGISTER, entity: 'User', entityId: user.id, ip: req.ip });
  return respondWithTokens(res, created, { user, tokens });
}

/** POST /login - authenticate and return tokens. */
export async function login(req, res) {
  const { user, tokens, isFirstLogin } = await svc.login(req.body);
  await writeAudit({ userId: user.id, action: AUDIT_ACTIONS.LOGIN, entity: 'User', entityId: user.id, ip: req.ip });
  return respondWithTokens(res, ok, { user, tokens, isFirstLogin: !!isFirstLogin });
}

/** POST /refresh - rotate tokens. */
export async function refresh(req, res) {
  const refreshToken = requireRefreshToken(req);
  const { user, tokens } = await svc.refresh(refreshToken);
  return respondWithTokens(res, ok, { user, tokens });
}

/** POST /logout - revoke the supplied refresh token. */
export async function logout(req, res) {
  const refreshToken = readRefreshToken(req);
  if (refreshToken) await svc.logout(refreshToken);
  clearAuthCookies(res);
  await writeAudit({ userId: req.user?.id ?? null, action: AUDIT_ACTIONS.LOGOUT, entity: 'User', entityId: req.user?.id ?? null, ip: req.ip });
  return noContent(res);
}

/** GET /profile - return the authenticated user's profile. */
export async function getProfile(req, res) {
  const user = await svc.getProfile(req.user.id);
  return ok(res, user);
}

/** PATCH /profile - update profile fields. */
export async function updateProfile(req, res) {
  const user = await svc.updateProfile(req.user.id, req.body);
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.USER_UPDATE, entity: 'User', entityId: req.user.id, ip: req.ip });
  return ok(res, user);
}

/** POST /change-password - change the authenticated user's password. */
export async function changePassword(req, res) {
  await svc.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.USER_UPDATE, entity: 'User', entityId: req.user.id, metadata: { passwordChanged: true }, ip: req.ip });
  return ok(res, { message: 'Password updated successfully' });
}

/** POST /forgot-password - issue a reset token. */
export async function forgotPassword(req, res) {
  const result = await svc.forgotPassword(req.body.email);
  return ok(res, { message: 'If the email exists, a reset link has been sent', ...result });
}

/** POST /reset-password - consume a reset token and restore session. */
export async function resetPassword(req, res) {
  const { user, tokens } = await svc.resetPassword(req.body.token, req.body.newPassword);
  return respondWithTokens(res, ok, {
    user,
    tokens,
    message: 'Password has been reset successfully',
  });
}
