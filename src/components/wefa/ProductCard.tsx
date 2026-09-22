import { Link } from "@tanstack/react-router";

import {
  formatPrice,
  productImageUrl,
  publishedVariants,
  taxIncludedOf,
  taxLabel,
  taxRateOf,
  type Product,
  type StoreDiscount,
} from "@/lib/directus";
import { volumeRowsForProduct } from "@/lib/pricing";

export function ProductCard({
  product,
  discounts = [],
}: {
  product: Product;
  discounts?: StoreDiscount[];
}) {
  const image = productImageUrl(product);
  const categoryName = product.category?.name || "Otros";
  const price = formatPrice(product.price, product.currency);
  const iva = taxLabel(
    taxRateOf(product, publishedVariants(product)[0]),
    taxIncludedOf(product, publishedVariants(product)[0]),
  );
  const wholesale = volumeRowsForProduct(product, discounts).length > 0;

  return (
    <article className="flex flex-col border border-border bg-background">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        aria-label={`Ver detalles: ${product.name}`}
        className="group relative block overflow-hidden bg-white"
      >
        <div className="flex aspect-[5/4] items-center justify-center p-3">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs uppercase tracking-widest text-muted-foreground transition-transform duration-300 ease-out group-hover:scale-[1.04]">
              REDEX
            </div>
          )}
        </div>
        {wholesale ? (
          <span className="pointer-events-none absolute left-[-40px] top-[18px] z-10 w-[150px] -rotate-45 bg-primary py-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
            Al por mayor
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 border-t border-border p-3.5 sm:p-4">
        <h2 className="text-[11px] font-bold uppercase leading-snug tracking-wide text-foreground sm:text-xs">
          {product.name}
        </h2>
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground sm:text-[11px]">
          {categoryName}
        </p>
        {price ? (
          <p className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {price}{" "}
            <span className="text-[10px] font-normal text-muted-foreground sm:text-[11px]">
              {iva}
            </span>
          </p>
        ) : null}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="mt-auto pt-2 text-[11px] font-medium uppercase tracking-wide text-primary transition-colors hover:text-primary-dark"
        >
          Ver detalles →
        </Link>
      </div>
    </article>
  );
}
