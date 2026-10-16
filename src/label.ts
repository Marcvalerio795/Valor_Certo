export type LabelSuggestion = { name: string; prices: number[] };
// Keep every distinct amount: promotion, loyalty and per-kg prices need human review.
export function parseLabel(text: string): LabelSuggestion {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const prices: number[] = [];
  const pattern = /(?<![\d.,])(?:\d{1,3}(?:\.\d{3})+|\d{1,6})[,.]\d{2}(?!\d|[.,]\d)/g;
  for (const match of text.matchAll(pattern)) {
    const value = match[0];
    const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
    const cents = Math.round(Number(normalized) * 100);
    if (Number.isSafeInteger(cents) && cents > 0 && !prices.includes(cents)) prices.push(cents);
  }
  const name = lines.find(line => /[a-zÀ-ÿ]{3}/i.test(line)
    && !/(R\$|\d[,.]\d{2}|oferta|promo[cç][aã]o|validade|v[aá]lido|clube|cliente|cart[aã]o|atacado|varejo|pre[cç]o|leve\s+\d|pague|c[oó]digo|c[oó]d\.?\s*\d|cnpj)/i.test(line)) ?? '';
  return { name: name.slice(0, 100), prices };
}
