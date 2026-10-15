import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePrice, totals } from './prices.ts';
test('prices use integer cents and reject invalid input', () => {
  assert.equal(parsePrice('12,99'), 1299);
  assert.equal(parsePrice('0.10'), 10);
  for (const value of ['', '-2', '1,234', 'NaN', '1e3']) assert.equal(parsePrice(value), null);
});
test('comparison includes quantities and distinguishes unchecked products', () => {
  assert.deepEqual(totals([
    { id: '1', name: 'Arroz', quantity: 2, shelf: 1299, checkout: 1399 },
    { id: '2', name: 'Leite', quantity: 1, shelf: 450, checkout: null },
  ]), { expected: 3048, charged: 3248, checked: 1 });
});
