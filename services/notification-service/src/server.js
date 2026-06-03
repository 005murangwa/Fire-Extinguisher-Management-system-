/**
 * @file server.js
 * @module notification-service/server
 *
 * Purpose:
 *   Bootstrap the Notification Service.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, startServer } from '@fems/shared/createApp.js';
import { config } from '@fems/shared/config.js';
import { mountRoutes } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { app, logger } = createApp({
  serviceName: 'notification-service',
  openapiPath: path.resolve(__dirname, '../openapi.yaml'),
  basePath: '/api/v1',
  mountRoutes,
});

startServer(app, config.ports.notification, logger);
