/**
 * @file exporter.test.js
 * Tests CSV serialisation (escaping) and PDF generation.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCsv, toPdf } from '../../services/reporting-service/src/exporters.js';

test('toCsv emits a header and escapes special characters', () => {
  const csv = toCsv([{ name: 'CO2', note: 'has, comma' }, { name: 'Water', note: 'plain' }]);
  const lines = csv.trim().split('\n');
  assert.equal(lines[0], 'name,note');
  assert.equal(lines[1], 'CO2,"has, comma"');
  assert.equal(lines[2], 'Water,plain');
});

test('toCsv returns empty string for no rows', () => {
  assert.equal(toCsv([]), '');
});

test('toPdf returns a PDF buffer', async () => {
  const buf = await toPdf({ title: 'Test', sections: [{ heading: 'S', rows: [['k', 'v']] }] });
  assert.ok(Buffer.isBuffer(buf));
  // PDF files start with the magic bytes "%PDF".
  assert.equal(buf.subarray(0, 4).toString(), '%PDF');
});
