/**
 * @file server.js
 * @module gateway/server
 *
 * Purpose:
 *   Single public entry point for the FEMS platform. The gateway terminates
 *   client traffic, applies the shared security baseline (secure headers, CORS,
 *   rate limiting) and reverse-proxies each path prefix to the owning
 *   microservice. It also hosts an aggregated Swagger UI listing every service.
 *
 * Responsibilities:
 *   - Route /api/v1/<prefix> to the correct internal service.
 *   - Apply cross-cutting security middleware once at the edge.
 *   - Expose /health and /docs.
 */

import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import swaggerUi from 'swagger-ui-express';
import { createLogger, createHttpLogger } from '@fems/shared/logger.js';
import { secureHeaders, corsMiddleware } from '@fems/shared/middleware/security.js';
import { gatewayRateLimiter } from './middleware/rateLimit.js';
import { config } from '@fems/shared/config.js';

const logger = createLogger('gateway');
const app = express();
app.set('trust proxy', 1);

// --- Security baseline at the edge ---
app.use(secureHeaders());
app.use(corsMiddleware());
app.use(gatewayRateLimiter());
app.use(createHttpLogger(logger));

/**
 * Routing table: path prefix -> upstream service base URL. Order matters; more
 * specific prefixes are registered before generic ones.
 * @type {Array<{prefix:string, target:string, name:string}>}
 */
const routes = [
  { prefix: '/api/v1/auth', target: config.services.auth, name: 'auth-service' },
  { prefix: '/api/v1/users', target: config.services.user, name: 'user-service' },
  { prefix: '/api/v1/roles', target: config.services.user, name: 'user-service' },
  { prefix: '/api/v1/extinguishers', target: config.services.extinguisher, name: 'extinguisher-service' },
  { prefix: '/api/v1/inspections', target: config.services.inspection, name: 'inspection-service' },
  { prefix: '/api/v1/maintenance', target: config.services.inspection, name: 'inspection-service' },
  { prefix: '/api/v1/timelines', target: config.services.inspection, name: 'inspection-service' },
  { prefix: '/api/v1/notifications', target: config.services.notification, name: 'notification-service' },
  { prefix: '/api/v1/reports', target: config.services.reporting, name: 'reporting-service' },
  { prefix: '/api/v1/audit-logs', target: config.services.reporting, name: 'reporting-service' },
  { prefix: '/api/v1/requests', target: config.services.request, name: 'request-service' },
];

// Health endpoint for the gateway itself.
app.get('/health', (_req, res) => res.json({ success: true, data: { service: 'gateway', status: 'healthy' } }));

// Aggregated documentation index pointing at each service's Swagger UI.
const docsIndex = {
  service: 'TZW FEMS API Gateway',
  version: '1.0.0',
  services: routes
    .filter((r, idx, arr) => arr.findIndex((x) => x.name === r.name) === idx)
    .map((r) => ({ name: r.name, docs: `${r.target}/docs`, openapi: `${r.target}/openapi.json` })),
};
app.get('/docs.json', (_req, res) => res.json(docsIndex));
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(null, {
    explorer: true,
    swaggerOptions: {
      urls: docsIndex.services.map((s) => ({ url: s.openapi, name: s.name })),
    },
    customSiteTitle: 'TZW FEMS API',
  })
);

// --- Reverse proxy each prefix to its upstream service ---
for (const route of routes) {
  app.use(
    route.prefix,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      // Express strips the mount prefix from req.url; forward the full original
      // URL so the upstream service (mounted under the same prefix) matches.
      pathRewrite: (_path, req) => req.originalUrl,
      on: {
        error(err, _req, res) {
          logger.error({ err, service: route.name }, 'Upstream proxy error');
          if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
          }
          res.end(JSON.stringify({ success: false, error: { code: 'BAD_GATEWAY', message: `${route.name} is unavailable` } }));
        },
      },
    })
  );
}

// Fallback 404 for unknown routes.
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `No route for ${req.method} ${req.originalUrl}` } });
});

const port = config.ports.gateway;
const server = app.listen(port, () => logger.info(`API Gateway listening on http://localhost:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
