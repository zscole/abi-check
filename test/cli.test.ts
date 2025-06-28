import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('verifies exit codes exist', () => {
  // Basic smoke test that the process object has exit method
  assert.type(process.exit, 'function');
});

test('verifies console methods exist', () => {
  // Basic smoke test for output methods
  assert.type(console.log, 'function');
  assert.type(console.error, 'function');
});

test.run(); 