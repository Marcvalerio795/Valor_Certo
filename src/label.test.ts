import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLabel } from './label.ts';
test('extracts product and decimal prices without turning barcode into a price', () => {
  assert.deepEqual(parseLabel('ARROZ BRANCO 5 KG\n7891234567890\nR$ 25,98'), { name: 'ARROZ BRANCO 5 KG', prices: [2598] });
});
test('retains different prices instead of choosing a promotion automatically', () => {
  assert.deepEqual(parseLabel('OFERTA\nLEITE INTEGRAL 1L\nNormal R$ 6,99\nClube R$ 4,99\n4,99'), { name: 'LEITE INTEGRAL 1L', prices: [699, 499] });
});
test('supports dot decimals, thousands and missing recognition', () => {
  assert.deepEqual(parseLabel('CAFÉ\n12.99\nR$ 1.299,90'), { name: 'CAFÉ', prices: [1299, 129990] });
  assert.deepEqual(parseLabel(''), { name: '', prices: [] });
  assert.deepEqual(parseLabel('7891234567890\n0,00'), { name: '', prices: [] });
});
test('does not invent cents when OCR separates the digits', () => {
  assert.deepEqual(parseLabel('ARROZ\n12\n99'), { name: 'ARROZ', prices: [] });
});
