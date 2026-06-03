/**
 * @file createApp.js
 * @module @fems/shared/createApp
 *
 * Purpose:
 *   Factory that assembles a hardened, conventionally-configured Express app so
 *   each microservice only has to register its own routes. This eliminates
 *   duplicated bootstrapping code across the six services.
 *
 * Responsibilities:
 *   - Mount security middleware (helmet, CORS, rate limiting).
 *   - Mount structured request logging and JSON body parsing.
 *   - Expose /health and (optionally) /docs Swagger UI.
 *   - Mount the centralised 404 + error handlers last.
 */

import express from 'express';
import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { createLogger, createHttpLogger } from './logger.js';
import {
  secureHeaders,
  corsMiddleware,
  generalRateLimiter,
} from './middleware/security.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { ping } from './db.js';

/**
 * Create a fully configured Express application for a microservice.
 *
 * @param {object} options - Application options.
 * @param {string} options.serviceName - Logical service name (logging/health).
 * @param {(router: import('express').Router, deps: {logger: import('pino').Logger}) => void} options.mountRoutes
 *        - Callback that mounts the service's routes on the provided router.
 * @param {string} [options.openapiPath] - Absolute path to the service's
 *        OpenAPI YAML; when provided, Swagger UI is served at /docs.
 * @param {string} [options.basePath='/'] - Path the service router is mounted
 *        under. The gateway forwards the full original URL, so each service
 *        mounts its routes under the same prefix it is exposed at.
 * @param {boolean} [options.enableRateLimit=true] - Toggle general rate limit.
 * @returns {{app: import('express').Express, logger: import('pino').Logger}}
 */
export function createApp({ serviceName, mountRoutes, openapiPath, basePath = '/', enableRateLimit = true }) {
  const app = express();
  const logger = createLogger(serviceName);

  // Trust the gateway/reverse proxy so client IPs and rate limiting work.
  app.set('trust proxy', 1);

  // --- Security baseline ---
  app.use(secureHeaders());
  app.use(corsMiddleware());
  if (enableRateLimit) app.use(generalRateLimiter());

  // --- Observability + parsing ---
  app.use(createHttpLogger(logger));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // --- Liveness / readiness probe ---
  app.get('/health', async (_req, res) => {
    const dbUp = await ping();
    res.status(dbUp ? 200 : 503).json({
      success: dbUp,
      data: { service: serviceName, status: dbUp ? 'healthy' : 'degraded', db: dbUp },
    });
  });

  // --- Swagger UI (per-service interactive docs) ---
  if (openapiPath && fs.existsSync(openapiPath)) {
    const spec = YAML.parse(fs.readFileSync(openapiPath, 'utf8'));
    app.get('/openapi.json', (_req, res) => res.json(spec));
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: `${serviceName} API` }));
  }

  // --- Service-specific routes (mounted under the service base path) ---
  const router = express.Router();
  mountRoutes(router, { logger });
  app.use(basePath, router);

  // --- Centralised error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, logger };
}

/**
 * Start an HTTP server for an app with graceful shutdown wiring.
 *
 * @param {import('express').Express} app - The Express app.
 * @param {number} port - Port to listen on.
 * @param {import('pino').Logger} logger - Logger for lifecycle messages.
 * @returns {import('node:http').Server} The HTTP server.
 */
export function startServer(app, port, logger) {
  const server = app.listen(port, () => {
    logger.info(`listening on http://localhost:${port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      logger.info(`${signal} received, shutting down`);
      server.close(() => process.exit(0));
    });
  }
  return server;
}

export default createApp;
