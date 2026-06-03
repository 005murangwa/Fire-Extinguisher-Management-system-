/**
 * @file rateLimit.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLocalhostRequest } from '../../gateway/src/middleware/rateLimit.js';

test('isLocalhostRequest matches loopback addresses', () => {
  assert.equal(isLocalhostRequest({ ip: '127.0.0.1' }), true);
  assert.equal(isLocalhostRequest({ ip: '::ffff:127.0.0.1' }), true);
  assert.equal(isLocalhostRequest({ ip: '::1' }), true);
  assert.equal(isLocalhostRequest({ ip: '203.0.113.1' }), false);
});
