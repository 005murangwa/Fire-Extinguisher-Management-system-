/**
 * @file mail.js
 * SMTP email helper (Nodemailer). Configure via .env SMTP_* variables.
 */

import nodemailer from 'nodemailer';
import { config } from './config.js';
import { createLogger } from './logger.js';

const logger = createLogger('mail');

let transporter;

/**
 * @returns {boolean} True when SMTP host is configured.
 */
export function isSmtpConfigured() {
  return Boolean(config.smtp.host && String(config.smtp.host).trim());
}

function getTransporter() {
  if (transporter) return transporter;
  if (!config.smtp.host) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
  return transporter;
}

/**
 * Send an email. In dev without SMTP, logs to console instead of failing registration.
 * @param {{ to: string, subject: string, text: string, html?: string }} opts
 */
export async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  const from = config.smtp.from;
  if (!tx) {
    logger.warn({ to, subject }, 'SMTP not configured — email logged to console');
    console.log('\n--- EMAIL (dev) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${text}\n---\n`);
    return { messageId: 'dev-console', dev: true };
  }
  try {
    const info = await tx.sendMail({ from, to, subject, text, html: html || text.replace(/\n/g, '<br>') });
    return info;
  } catch (err) {
    logger.error({ err, to, subject }, 'SMTP send failed');
    throw err;
  }
}

export default { sendMail, isSmtpConfigured };
