/**
 * @file embedded-pg.js
 *
 * Purpose:
 *   Start a self-contained PostgreSQL instance (via the `embedded-postgres`
 *   package) for local development and testing on machines without Docker or a
 *   system PostgreSQL. The server stays alive until the process is signalled.
 *
 * Usage:
 *   node scripts/embedded-pg.js
 */

import EmbeddedPostgres from 'embedded-postgres';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../.pgdata');

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: process.env.POSTGRES_USER || 'fems_app',
  password: process.env.POSTGRES_PASSWORD || 'change_me_in_production',
  port: Number(process.env.POSTGRES_PORT || 5432),
  persistent: true,
});

async function main() {
  // Initialise the data directory on first run only.
  const fs = await import('node:fs');
  if (!fs.existsSync(dataDir)) {
    console.log('Initialising embedded PostgreSQL data directory...');
    await pg.initialise();
  }
  await pg.start();
  // Ensure the application database exists (ignore "already exists").
  try {
    await pg.createDatabase(process.env.POSTGRES_DB || 'fems');
  } catch (err) {
    if (!/already exists/i.test(String(err.message))) throw err;
  }
  console.log(`Embedded PostgreSQL ready on port ${process.env.POSTGRES_PORT || 5432}`);

  const shutdown = async () => {
    console.log('Stopping embedded PostgreSQL...');
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Embedded PostgreSQL failed:', err);
  process.exit(1);
});
