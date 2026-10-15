export type Product = { id: string; name: string; quantity: number; shelf: number; checkout: number | null };
export function parsePrice(value: string): number | null {
  const clean = value.trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(clean)) return null;
  const cents = Math.round(Number(clean.replace(',', '.')) * 100);
  return Number.isSafeInteger(cents) ? cents : null;
}
export function totals(items: Product[]) {
  return items.reduce((sum, item) => ({
    expected: sum.expected + item.shelf * item.quantity,
    charged: sum.charged + (item.checkout ?? item.shelf) * item.quantity,
    checked: sum.checked + (item.checkout === null ? 0 : 1),
  }), { expected: 0, charged: 0, checked: 0 });
}
export const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
