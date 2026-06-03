/**
 * @file server.js
 * @module reporting-service/server
 *
 * Purpose:
 *   Bootstrap the Reporting Service.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, startServer } from '@fems/shared/createApp.js';
import { config } from '@fems/shared/config.js';
import { mountRoutes } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { app, logger } = createApp({
  serviceName: 'reporting-service',
  openapiPath: path.resolve(__dirname, '../openapi.yaml'),
  basePath: '/api/v1',
  mountRoutes,
});

startServer(app, config.ports.reporting, logger);
