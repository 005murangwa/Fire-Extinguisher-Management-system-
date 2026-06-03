/**
 * @file run-report.js
 *
 * Purpose:
 *   Execute the test suite using the Node test runner's programmatic API and
 *   write a Markdown summary to docs/test-results/TEST-RESULTS.md. This produces
 *   a submission-ready test report.
 *
 * Usage:
 *   npm run test:report
 */

import { run } from 'node:test';
import { tap } from 'node:test/reporters';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'docs', 'test-results');

/** Collect every test file under tests/. */
async function collectFiles() {
  const files = [];
  for await (const f of glob('tests/**/*.test.js')) files.push(path.join(repoRoot, f));
  return files;
}

const counts = { pass: 0, fail: 0, skipped: 0 };
const failures = [];

const files = await collectFiles();
const stream = run({ files, concurrency: true });

stream.on('test:pass', (e) => {
  if (e.skip || e.todo) counts.skipped += 1;
  else counts.pass += 1;
});
stream.on('test:fail', (e) => {
  counts.fail += 1;
  failures.push(e.name);
});

// Mirror to console as TAP for live feedback.
stream.compose(tap).pipe(process.stdout);

stream.on('end', () => {
  fs.mkdirSync(outDir, { recursive: true });
  const total = counts.pass + counts.fail + counts.skipped;
  const md = `# Test Results

_Generated: ${new Date().toISOString()}_

## Summary

| Metric | Value |
| ------ | ----- |
| Total tests | ${total} |
| Passed | ${counts.pass} |
| Failed | ${counts.fail} |
| Skipped (DB-dependent integration) | ${counts.skipped} |

## Test Categories

- **Unit tests** (no database): password policy & hashing, JWT signing/verification,
  request validation schemas, centralised error mapping, RBAC + authentication
  middleware, CSV/PDF export and pagination parsing.
- **Integration / API tests** (require PostgreSQL): registration, login,
  duplicate-email conflict, profile authorization, RBAC on writes, unique-serial
  conflict and the expiry-after-installation rule. These are skipped when no
  database is reachable.

${failures.length ? `## Failures\n\n${failures.map((f) => `- ${f}`).join('\n')}\n` : 'All executed tests passed.\n'}
`;
  fs.writeFileSync(path.join(outDir, 'TEST-RESULTS.md'), md);
  console.log(`\nReport written to docs/test-results/TEST-RESULTS.md`);
  if (counts.fail > 0) process.exitCode = 1;
});
