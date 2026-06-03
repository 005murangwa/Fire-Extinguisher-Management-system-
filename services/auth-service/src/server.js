/**
 * @file server.js
 * @module auth-service/server
 *
 * Purpose:
 *   Bootstrap and start the Authentication Service using the shared app factory.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, startServer } from '@fems/shared/createApp.js';
import { config } from '@fems/shared/config.js';
import { mountRoutes } from './routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { app, logger } = createApp({
  serviceName: 'auth-service',
  openapiPath: path.resolve(__dirname, '../openapi.yaml'),
  basePath: '/api/v1/auth',
  mountRoutes,
});

startServer(app, config.ports.auth, logger);
