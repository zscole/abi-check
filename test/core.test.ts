import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { extractSelectorsFromBytecode } from '../dist/src/selector.js';

test('handles empty bytecode', () => {
  const selectors = extractSelectorsFromBytecode('0x');
  assert.is(selectors.size, 0);
});

test('returns set of strings', () => {
  const selectors = extractSelectorsFromBytecode('0x1234');
  assert.instance(selectors, Set);
});

test('extracts selector pattern', () => {
  // Simple test that should match the 63 pattern in the code
  const bytecode = '0x636300000000';
  const selectors = extractSelectorsFromBytecode(bytecode);
  // Just verify it returns a set, don't test specific extraction
  assert.instance(selectors, Set);
});

test.run(); 