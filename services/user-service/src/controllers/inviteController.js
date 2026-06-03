/**
 * @file inviteController.js
 * @module user-service/controllers/invite
 *
 * Purpose:
 *   Admin invite flow for inspectors: validate input, generate a compliant
 *   temporary password, create the user, and send invitation email with clear
 *   errors for duplicates and mail failures.
 */

import crypto from 'node:crypto';
import { created } from '@fems/shared/http.js';
import { hashPassword, validatePasswordStrength } from '@fems/shared/password.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AUDIT_ACTIONS, ROLES } from '@fems/shared/constants.js';
import { config } from '@fems/shared/config.js';
import { sendMail, isSmtpConfigured } from '@fems/shared/mail.js';
import {
  ConflictError,
  BadRequestError,
  AppError,
} from '@fems/shared/errors.js';
import * as repo from '../repository.js';

/**
 * Generate a random password that satisfies the FEMS strength policy.
 * @returns {string}
 */
export function generateTempPassword() {
  const lower = crypto.randomBytes(4).toString('hex');
  const upper = crypto.randomBytes(2).toString('hex').toUpperCase();
  const digit = String(crypto.randomInt(2, 9));
  return `Tz${upper}${lower}${digit}!`;
}

/**
 * Map database errors to HTTP errors.
 * @param {unknown} err
 * @throws {AppError|unknown}
 */
function rethrowDbError(err) {
  if (err instanceof AppError) throw err;
  if (err?.code === '23505') {
    throw new ConflictError('Email is already in use');
  }
  throw err;
}

/**
 * POST /users/invite-inspector
 */
export async function inviteInspector(req, res) {
  const { firstName, lastName, email, message } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  if (await repo.emailTaken(normalizedEmail)) {
    throw new ConflictError('An account with this email already exists');
  }

  if (config.isProd && !isSmtpConfigured()) {
    throw new BadRequestError(
      'Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS before sending invites.'
    );
  }

  const tempPassword = generateTempPassword();
  const strength = validatePasswordStrength(tempPassword);
  if (!strength.valid) {
    throw new BadRequestError('Failed to generate a valid temporary password');
  }

  const passwordHash = await hashPassword(tempPassword);
  let user;

  try {
    user = await repo.createUser({
      firstName,
      lastName,
      email: normalizedEmail,
      passwordHash,
      role: ROLES.INSPECTOR,
      isFirstLogin: true,
      invitedBy: req.user.id,
    });
  } catch (err) {
    rethrowDbError(err);
  }

  const loginUrl = `${config.app.publicUrl}/login`;
  const emailText = [
    `Hello ${firstName},`,
    '',
    'You have been invited to TZW FEMS as an Inspector.',
    '',
    `Login URL: ${loginUrl}`,
    `Email: ${normalizedEmail}`,
    `Temporary password: ${tempPassword}`,
    '',
    'You must change your password on first login.',
    message ? `\nMessage from admin:\n${message}` : '',
  ].join('\n');

  try {
    await sendMail({
      to: normalizedEmail,
      subject: 'TZW FEMS — Inspector invitation',
      text: emailText,
      html: emailText.replace(/\n/g, '<br>'),
    });
  } catch (err) {
    await repo.deleteUser(user.id);
    throw new BadRequestError(
      `Invitation email could not be sent: ${err?.message || 'check SMTP configuration'}`
    );
  }

  await writeAudit({
    userId: req.user.id,
    action: AUDIT_ACTIONS.USER_UPDATE,
    entity: 'User',
    entityId: user.id,
    metadata: { invited: true, email: normalizedEmail },
    ip: req.ip,
  });

  const payload = {
    user,
    message: 'Invitation sent successfully',
  };

  if (!config.isProd && !isSmtpConfigured()) {
    payload.devNote = 'SMTP not configured — temporary password included for local testing';
    payload.temporaryPassword = tempPassword;
  }

  return created(res, payload);
}
