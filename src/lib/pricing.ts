import {
  formatPrice,
  publishedVariants,
  type Product,
  type ProductVariant,
  type StoreDiscount,
} from "@/lib/directus";

function toAmount(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(n) ? n : null;
}

function moneyRound(n: number): number {
  return Math.round(n * 100) / 100;
}

function relId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return id != null ? String(id) : null;
  }
  return null;
}

function targetIds(d: StoreDiscount): string[] {
  const raw = d.target_ids;
  let ids: string[] = [];
  if (Array.isArray(raw)) {
    ids = raw.map((x) => String(x)).filter(Boolean);
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        ids = parsed.map((x) => String(x)).filter(Boolean);
      } else {
        ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      ids = raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (!ids.length) {
    if (d.applies_to === "category") {
      const id = relId(d.category);
      if (id) ids = [id];
    } else if (d.applies_to === "product") {
      const id = relId(d.product);
      if (id) ids = [id];
    } else if (d.applies_to === "variant") {
      const id = relId(d.variant);
      if (id) ids = [id];
    }
  }
  return ids;
}

function matchesProduct(d: StoreDiscount, productId: string): boolean {
  return targetIds(d).some(
    (t) => t === productId || t === `product:${productId}`,
  );
}

function matchesVariant(d: StoreDiscount, variantId: string): boolean {
  const targets = targetIds(d);
  if (targets.includes(variantId) || targets.includes(`variant:${variantId}`)) {
    return true;
  }
  return relId(d.variant) === variantId;
}

export type VolumeRow = {
  key: string;
  kind: "quantity" | "money";
  threshold: string;
  price: string | null;
  off: string;
};

type BreakRow = {
  kind: "quantity" | "money";
  floor: number;
  type: "percentage" | "fixed";
  value: number;
};

function breakRows(d: StoreDiscount): BreakRow[] {
  const stored =
    Array.isArray(d.tier_breaks) && d.tier_breaks.length
      ? d.tier_breaks
      : Array.isArray(d.tiers) && d.tiers.length
        ? d.tiers
        : null;
  const source = stored ?? [
    {
      min_quantity: d.min_quantity,
      min_subtotal: d.min_subtotal,
      type: d.type,
      value: d.value,
    },
  ];
  const money = d.threshold_type === "money";
  const out: BreakRow[] = [];
  for (const t of source) {
    const value = toAmount(t.value);
    if (value == null || value < 0) continue;
    const type = ((t.type || d.type) === "fixed" ? "fixed" : "percentage") as
      | "percentage"
      | "fixed";
    if (money) {
      const floor = toAmount(
        t.min_subtotal != null && t.min_subtotal !== ""
          ? t.min_subtotal
          : d.min_subtotal,
      );
      if (floor == null || floor <= 0) continue;
      out.push({ kind: "money", floor, type, value });
    } else {
      const floor = t.min_quantity ?? d.min_quantity ?? null;
      if (floor == null || floor < 1) continue;
      out.push({ kind: "quantity", floor, type, value });
    }
  }
  out.sort((a, b) => a.floor - b.floor);
  return out;
}

export function matchingDiscounts(
  product: Product,
  variant: ProductVariant | null | undefined,
  discounts: StoreDiscount[],
): StoreDiscount[] {
  const categoryId = relId(product.category);
  const seen = new Set<string>();
  const out: StoreDiscount[] = [];
  const push = (d: StoreDiscount) => {
    if (seen.has(d.id)) return;
    seen.add(d.id);
    out.push(d);
  };

  if (variant) {
    for (const d of discounts) {
      if (
        d.applies_to === "variant" &&
        (matchesVariant(d, variant.id) || matchesProduct(d, product.id))
      ) {
        push(d);
      }
    }
  }

  for (const d of discounts) {
    if (d.applies_to === "product" && matchesProduct(d, product.id)) {
      push(d);
    }
  }

  if (categoryId) {
    for (const d of discounts) {
      if (d.applies_to === "category" && targetIds(d).includes(categoryId)) {
        push(d);
      }
    }
  }

  return out;
}

function unitAfterQuantity(unit: number, tier: BreakRow): number {
  if (tier.type === "percentage") {
    return moneyRound(Math.max(0, unit * (1 - tier.value / 100)));
  }
  return moneyRound(Math.max(0, unit - tier.value));
}

function offText(tier: BreakRow, currency?: string | null): string {
  if (tier.type === "percentage") {
    const n = Number.isInteger(tier.value)
      ? String(tier.value)
      : String(tier.value);
    return `−${n}%`;
  }
  const formatted = formatPrice(tier.value, currency);
  return formatted ? `−${formatted}/u` : `−${tier.value}/u`;
}

function mergedBreaks(
  product: Product,
  variant: ProductVariant | null | undefined,
  discounts: StoreDiscount[],
): BreakRow[] {
  const byKey = new Map<string, BreakRow>();
  for (const d of matchingDiscounts(product, variant, discounts)) {
    for (const t of breakRows(d)) {
      const key = `${t.kind}:${t.floor}`;
      const prev = byKey.get(key);
      if (!prev || t.value > prev.value) byKey.set(key, t);
    }
  }
  return [...byKey.values()].sort((a, b) => a.floor - b.floor);
}

export function volumeRowsFor(
  product: Product,
  variant: ProductVariant | null | undefined,
  discounts: StoreDiscount[],
): VolumeRow[] {
  const tiers = mergedBreaks(product, variant, discounts);
  if (!tiers.length) return [];
  const unit = toAmount(variant?.price ?? product.price);
  return tiers.map((t) => {
    const off = offText(t, product.currency);
    const threshold =
      t.kind === "money"
        ? `Desde ${formatPrice(t.floor, product.currency) ?? t.floor}`
        : `${t.floor}+`;
    const showUnit = unit != null;
    return {
      key: `${t.kind}:${t.floor}`,
      kind: t.kind,
      threshold,
      price: showUnit
        ? formatPrice(unitAfterQuantity(unit, t), product.currency)
        : null,
      off,
    };
  });
}

export function volumeRowsForProduct(
  product: Product,
  discounts: StoreDiscount[],
): VolumeRow[] {
  const variants = publishedVariants(product);
  if (!variants.length) {
    return volumeRowsFor(product, null, discounts);
  }
  const first = volumeRowsFor(product, variants[0], discounts);
  const same = variants.every((v) => {
    const rows = volumeRowsFor(product, v, discounts);
    if (rows.length !== first.length) return false;
    return rows.every(
      (r, i) =>
        r.key === first[i]?.key &&
        r.off === first[i]?.off &&
        r.price === first[i]?.price,
    );
  });
  if (same && first.length) return first;

  const any = variants
    .map((v) => volumeRowsFor(product, v, discounts))
    .find((rows) => rows.length > 0);
  return any || first;
}

export function hasVolumePricing(
  product: Product,
  variant: ProductVariant | null | undefined,
  discounts: StoreDiscount[],
): boolean {
  return volumeRowsFor(product, variant, discounts).length > 0;
}

export type PriceBreak = {
  kind: "quantity" | "money";
  floor: number;
  type: "percentage" | "fixed";
  value: number;
};

export function priceBreaksFor(
  product: Product,
  variant: ProductVariant | null | undefined,
  discounts: StoreDiscount[],
): PriceBreak[] {
  return mergedBreaks(product, variant, discounts).map((t) => ({
    kind: t.kind,
    floor: t.floor,
    type: t.type,
    value: t.value,
  }));
}

export function quoteLine(
  unitPrice: number,
  quantity: number,
  breaks: PriceBreak[],
): {
  quantity: number;
  gross: number;
  discount: number;
  net: number;
} {
  const qty = Math.max(1, Math.floor(quantity) || 1);
  const unit = Number.isFinite(unitPrice) ? unitPrice : 0;
  const gross = moneyRound(unit * qty);
  const moneyTiers = breaks.some((b) => b.kind === "money");
  const qualifying = breaks.filter((b) =>
    moneyTiers ? b.kind === "money" && gross >= b.floor : b.kind === "quantity" && qty >= b.floor,
  );
  const tier = qualifying.reduce<PriceBreak | null>(
    (best, row) => (!best || row.floor >= best.floor ? row : best),
    null,
  );
  let discount = 0;
  if (tier) {
    discount =
      tier.type === "percentage"
        ? moneyRound(Math.min(gross, (gross * tier.value) / 100))
        : moneyRound(Math.min(gross, tier.value * qty));
  }
  return {
    quantity: qty,
    gross,
    discount,
    net: moneyRound(Math.max(0, gross - discount)),
  };
}

export function formatVolumeLine(rows: VolumeRow[]): string {
  return rows
    .map((r) =>
      r.price ? `${r.threshold} ${r.price} ${r.off}` : `${r.threshold} ${r.off}`,
    )
    .join(" · ");
}
