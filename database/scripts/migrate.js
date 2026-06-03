/**
 * @file migrate.js
 *
 * Purpose:
 *   Apply the SQL schema + reference data to the configured PostgreSQL database.
 *   Runs every `*.sql` file in `database/sql` in lexical order. This is a
 *   lightweight migration runner appropriate for the academic deployment; a
 *   production system would use a versioned migration tool.
 *
 * Usage:
 *   npm run db:migrate
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query, closePool } from '@fems/shared/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.resolve(__dirname, '../sql');

/**
 * Execute all SQL files in the sql directory, in filename order.
 *
 * @returns {Promise<void>}
 */
async function migrate() {
  const files = fs
    .readdirSync(sqlDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(sqlDir, file), 'utf8');
    process.stdout.write(`Applying ${file} ... `);
    await query(sql);
    process.stdout.write('done\n');
  }
}

migrate()
  .then(() => {
    console.log('Migration complete.');
    return closePool();
  })
  .catch(async (err) => {
    console.error('Migration failed:', err.message);
    await closePool();
    process.exit(1);
  });
