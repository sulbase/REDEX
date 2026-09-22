import { createFileRoute, Link } from "@tanstack/react-router";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { ProductCard } from "@/components/wefa/ProductCard";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { VariantPicker } from "@/components/wefa/VariantPicker";
import { loadProductBySlug } from "@/lib/catalog";
import { productImageUrl, publishedVariants, datasheetAssetUrl, datasheetFileIds } from "@/lib/directus";

export const Route = createFileRoute("/products/$slug")({
  head: ({ loaderData, params }) => ({
    meta: [
      {
        title: `${loaderData?.product?.name || params.slug} — REDEX`,
      },
    ],
  }),
  loader: ({ params }) => loadProductBySlug({ data: params.slug }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product, similar, discounts } = Route.useLoaderData();

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative border-b border-border">
          <Header solid />
        </div>
        <main className="mx-auto max-w-3xl px-5 py-24 text-center">
          <h1 className="text-2xl font-semibold">Producto no encontrado</h1>
          <Link to="/products" className="mt-6 inline-block text-primary">
            ← Volver al catálogo
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const image = productImageUrl(product);
  const variants = publishedVariants(product);
  const datasheetIds = datasheetFileIds(product);
  const datasheetUrl =
    product.datasheet_url && /^https?:\/\//i.test(product.datasheet_url)
      ? product.datasheet_url
      : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border">
        <Header solid />
      </div>
      <main>
        <section className="mx-auto max-w-[1200px] px-5 py-12 lg:px-10 lg:py-16">
          <p className="text-sm text-muted-foreground">
            <Link to="/products" className="hover:text-primary">
              Productos
            </Link>
            {product.category?.name ? (
              <>
                <span className="mx-2">/</span>
                <span>{product.category.name}</span>
              </>
            ) : null}
          </p>

          <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <RiseIn className="flex aspect-square items-center justify-center bg-white p-6">
              {image ? (
                <img
                  src={image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                  REDEX
                </div>
              )}
            </RiseIn>

            <RiseIn delay={riseStagger(1)}>
              <div>
              <h1 className="text-3xl font-semibold uppercase tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              {product.description ? (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
              <div className="mt-8">
                {variants.length > 0 ? (
                  <VariantPicker
                    key={product.id}
                    product={product}
                    variants={variants}
                    discounts={discounts}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    Este producto no tiene variantes publicadas.
                  </p>
                )}
              </div>
              </div>
            </RiseIn>
          </div>
        </section>

        {product.datasheet_enabled && (datasheetIds.length > 0 || datasheetUrl) ? (
          <section className="border-t border-border">
            <RiseIn className="mx-auto max-w-[1200px] px-5 py-12 lg:px-10">
              <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Ficha técnica
              </h2>
              <div
                className={`mt-6 flex flex-col items-center gap-6 ${
                  datasheetIds.length > 1 ? "sm:flex-row" : ""
                }`}
              >
                {datasheetIds.map((id, index) => {
                  const table =
                    datasheetIds.length > 1 && index === datasheetIds.length - 1;
                  return (
                    <RiseIn key={id} delay={riseStagger(index)}>
                      <img
                        src={datasheetAssetUrl(id)}
                        alt=""
                        className={
                          table
                            ? "h-auto w-full min-w-0 flex-1 object-contain"
                            : "h-44 w-auto max-w-full shrink-0 object-contain sm:h-52"
                        }
                      />
                    </RiseIn>
                  );
                })}
              </div>
              {datasheetUrl ? (
                <a
                  href={datasheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium uppercase tracking-wide text-primary hover:text-primary-dark"
                >
                  Ver ficha técnica
                </a>
              ) : null}
            </RiseIn>
          </section>
        ) : null}

        {similar.length > 0 ? (
          <section className="border-t border-border bg-card py-16">
            <div className="mx-auto w-full max-w-[1280px] px-6 sm:px-10 md:px-14 lg:px-16 xl:px-20">
              <RiseIn>
                <h2 className="text-2xl font-semibold sm:text-3xl">
                  Productos similares
                </h2>
              </RiseIn>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {similar.map((item, i) => (
                  <RiseIn key={item.id} delay={riseStagger(i)} className="h-full">
                    <ProductCard product={item} discounts={discounts} />
                  </RiseIn>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
