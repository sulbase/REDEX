export function moneyRound(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Tax after promotions: `afterPromo` is the listed amount once discounts are applied. */
export function splitTax(
  afterPromo: number,
  rate: number,
  included: boolean,
): { net: number; tax: number; payable: number } {
  const base = moneyRound(Math.max(0, Number(afterPromo) || 0));
  const r = Number.isFinite(rate) ? Math.max(0, rate) : 0;
  if (r <= 0) return { net: base, tax: 0, payable: base };
  if (included) {
    const net = moneyRound(base / (1 + r / 100));
    return { net, tax: moneyRound(base - net), payable: base };
  }
  const tax = moneyRound(base * (r / 100));
  return { net: base, tax, payable: moneyRound(base + tax) };
}

export function taxBuckets(
  lines: Array<{ afterPromo: number; rate: number; included: boolean }>,
): { net: number; tax: number; payable: number; byRate: Array<{ rate: number; tax: number }> } {
  const map = new Map<number, number>();
  let net = 0;
  let tax = 0;
  let payable = 0;
  for (const line of lines) {
    const split = splitTax(line.afterPromo, line.rate, line.included);
    net += split.net;
    tax += split.tax;
    payable += split.payable;
    map.set(line.rate, moneyRound((map.get(line.rate) || 0) + split.tax));
  }
  const byRate = [...map.entries()]
    .map(([rate, amount]) => ({ rate, tax: amount }))
    .sort((a, b) => b.rate - a.rate);
  return {
    net: moneyRound(net),
    tax: moneyRound(tax),
    payable: moneyRound(payable),
    byRate,
  };
}

export function formatTaxRate(rate: number): string {
  if (!Number.isFinite(rate)) return "0";
  if (Number.isInteger(rate)) return String(rate);
  return String(rate)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
}
