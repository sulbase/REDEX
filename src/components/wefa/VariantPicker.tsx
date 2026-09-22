import { useEffect, useState } from "react";

import {
  formatPrice,
  optionValues,
  productImageUrl,
  specColumns,
  taxIncludedOf,
  taxLabel,
  taxRateOf,
  variantAttrMap,
  variantLabel,
  type Product,
  type ProductVariant,
  type StoreDiscount,
} from "@/lib/directus";
import { volumeRowsFor, priceBreaksFor } from "@/lib/pricing";
import { VolumePrices } from "@/components/wefa/VolumePrices";
import { CART_MAX_QTY, useCart } from "@/lib/cart";

export function VariantPicker({
  product,
  variants,
  discounts = [],
}: {
  product: Product;
  variants: ProductVariant[];
  discounts?: StoreDiscount[];
}) {
  const columns = specColumns(variants);
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const selected =
    variants.find((v) => v.id === selectedId) ?? variants[0] ?? null;
  const selectedAttrs = selected ? variantAttrMap(selected) : {};
  const price = formatPrice(
    selected?.price ?? product.price,
    product.currency,
  );
  const iva = taxLabel(taxRateOf(product, selected), taxIncludedOf(product, selected));
  const sku = selected?.sku || product.sku;
  const [quantity, setQuantity] = useState(1);
  const { addLine } = useCart();
  const unit = Number(selected?.price ?? product.price ?? 0);

  useEffect(() => {
    setQuantity(1);
  }, [product.id, selected?.id]);

  function selectOption(column: string, value: string) {
    const next = { ...selectedAttrs, [column]: value };
    const exact = variants.find((v) => {
      const attrs = variantAttrMap(v);
      return columns.every((col) => attrs[col] === next[col]);
    });
    if (exact) {
      setSelectedId(exact.id);
      return;
    }
    const fallback = variants.find((v) => variantAttrMap(v)[column] === value);
    if (fallback) setSelectedId(fallback.id);
  }

  return (
    <div>
      {price ? (
        <div>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {price}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{iva}</p>
        </div>
      ) : null}
      <VolumePrices
        rows={volumeRowsFor(product, selected, discounts)}
        currency={product.currency}
      />
      {sku ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Article{" "}
          <span className="font-medium tabular-nums text-foreground">{sku}</span>
        </p>
      ) : null}

      {columns.map((column) => (
        <div key={column} className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {column}
            {selectedAttrs[column] ? (
              <span className="ml-2 font-medium normal-case tracking-normal text-foreground">
                {selectedAttrs[column]}
              </span>
            ) : null}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {optionValues(variants, column).map((value) => {
              const active = selectedAttrs[column] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectOption(column, value)}
                  className={`border px-3 py-2 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center border border-border">
          <button
            type="button"
            className="px-3 py-2"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={CART_MAX_QTY}
            value={quantity}
            onChange={(event) =>
              setQuantity(
                Math.min(
                  CART_MAX_QTY,
                  Math.max(1, Math.floor(Number(event.target.value) || 1)),
                ),
              )
            }
            className="w-16 border-x border-border bg-transparent py-2 text-center text-sm tabular-nums outline-none"
          />
          <button
            type="button"
            className="px-3 py-2"
            disabled={quantity >= CART_MAX_QTY}
            onClick={() => setQuantity((value) => Math.min(CART_MAX_QTY, value + 1))}
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            addLine({
              id: selected?.id || product.id,
              productId: product.id,
              variantId: selected?.id || null,
              slug: product.slug,
              title: product.name,
              detail: selected ? variantLabel(selected) : null,
              sku: sku || null,
              imageUrl: productImageUrl(product),
              unitPrice: Number.isFinite(unit) ? unit : 0,
              currency: product.currency || null,
              taxRate: taxRateOf(product, selected),
              taxIncluded: taxIncludedOf(product, selected),
              quantity,
              breaks: priceBreaksFor(product, selected, discounts),
            });
            setQuantity(1);
          }}
          className="bg-primary px-5 py-2.5 text-sm font-medium uppercase tracking-wide text-primary-foreground"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
