/**
 * @file pagination.test.js
 * Tests the pagination/sort parser bounds and whitelisting.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination } from '@fems/shared/pagination.js';

test('applies sensible defaults', () => {
  const p = parsePagination({}, { allowedSort: ['created_at'] });
  assert.equal(p.page, 1);
  assert.equal(p.limit, 20);
  assert.equal(p.offset, 0);
  assert.equal(p.sortDir, 'DESC');
});

test('caps the page size at 100', () => {
  const p = parsePagination({ limit: '5000' }, { allowedSort: ['created_at'] });
  assert.equal(p.limit, 100);
});

test('ignores a non-whitelisted sort column', () => {
  const p = parsePagination({ sortBy: 'DROP TABLE users' }, { allowedSort: ['created_at'], defaultSort: 'created_at' });
  assert.equal(p.sortBy, 'created_at');
});

test('computes offset from page and limit', () => {
  const p = parsePagination({ page: '3', limit: '10' }, { allowedSort: ['created_at'] });
  assert.equal(p.offset, 20);
});
