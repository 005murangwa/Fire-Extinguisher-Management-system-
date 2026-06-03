/**
 * @file logger.js
 * @module @fems/shared/logger
 *
 * Purpose:
 *   Provide a single, structured (JSON) logger factory used across all
 *   services. Structured logging is a project requirement and makes the logs
 *   machine-parseable for monitoring/aggregation.
 *
 * Responsibilities:
 *   - Create namespaced child loggers per service.
 *   - Redact sensitive fields (passwords, tokens, auth headers) automatically.
 *   - Provide a pino-http request logger with sane defaults.
 */

import pino from 'pino';
import pinoHttp from 'pino-http';
import { config } from './config.js';

/**
 * Create a structured logger bound to a service name.
 *
 * @param {string} service - Logical name of the service (e.g. "auth-service").
 * @returns {import('pino').Logger} Configured pino logger instance.
 */
export function createLogger(service) {
  return pino({
    name: service,
    level: config.isProd ? 'info' : 'debug',
    // Never leak secrets into the logs.
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'passwordHash',
        '*.password',
        '*.passwordHash',
        'token',
        'accessToken',
        'refreshToken',
      ],
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Write structured JSON synchronously to stdout. (A pretty-printer such as
    // `pino-pretty` can be piped in during development if desired.)
  });
}

/**
 * Build an Express request-logging middleware for a service.
 *
 * @param {import('pino').Logger} logger - Base logger to attach.
 * @returns {import('express').RequestHandler} pino-http middleware.
 */
export function createHttpLogger(logger) {
  return pinoHttp({
    logger,
    // Attach a correlation id so a request can be traced across logs.
    genReqId: (req, res) => {
      const existing = req.headers['x-request-id'];
      const id = existing || crypto.randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  });
}

export default createLogger;
