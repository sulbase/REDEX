import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { ProductCard } from "@/components/wefa/ProductCard";
import { PageHero } from "@/components/wefa/PageHero";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { loadCatalog } from "@/lib/catalog";
import heroProducts from "@/assets/hero-products.jpg";

const PAGE_SIZE = 12;

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Productos — REDEX" },
      {
        name: "description",
        content: "Catálogo REDEX: tubería, conexiones y herramientas para obra.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    categoria: typeof search.categoria === "string" ? search.categoria : undefined,
  }),
  loader: () => loadCatalog(),
  component: ProductsPage,
});

function ProductsPage() {
  const { products, categories, discounts } = Route.useLoaderData();
  const { categoria } = Route.useSearch();
  const navigate = Route.useNavigate();
  const categorySlug = categoria || "all";
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [categoria]);

  const filtered = useMemo(() => {
    if (categorySlug === "all") return products;
    return products.filter((p) => p.category?.slug === categorySlug);
  }, [products, categorySlug]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const activeLabel =
    categorySlug === "all"
      ? "Todos los productos"
      : categories.find((c) => c.slug === categorySlug)?.name || "Todos los productos";

  function selectCategory(slug: string) {
    setPage(1);
    setFilterOpen(false);
    void navigate({
      search: { categoria: slug === "all" ? undefined : slug },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero eyebrow="REDEX" title="Productos" image={heroProducts} alt="" />

      <main className="mx-auto w-full max-w-[1280px] px-6 pb-24 pt-10 sm:px-10 md:px-14 lg:px-16 xl:px-20">
        <RiseIn className="relative mb-10 inline-block">
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-primary"
            aria-expanded={filterOpen}
          >
            {activeLabel}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {filterOpen ? (
            <div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] border border-border bg-background shadow-md">
              <FilterOption
                active={categorySlug === "all"}
                label="Todos los productos"
                onClick={() => selectCategory("all")}
              />
              {categories.map((c) => (
                <FilterOption
                  key={c.id}
                  active={categorySlug === c.slug}
                  label={c.name}
                  onClick={() => selectCategory(c.slug)}
                />
              ))}
            </div>
          ) : null}
        </RiseIn>

        {pageItems.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No hay productos en esta categoría.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((product, i) => (
              <RiseIn key={product.id} delay={riseStagger(i)} className="h-full">
                <ProductCard product={product} discounts={discounts} />
              </RiseIn>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <RiseIn className="mt-14 flex items-center justify-center gap-2">
            <PageBtn
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </PageBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <PageBtn
                key={n}
                active={n === currentPage}
                onClick={() => setPage(n)}
              >
                {n}
              </PageBtn>
            ))}
            <PageBtn
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </PageBtn>
          </RiseIn>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  ...rest
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 min-w-10 items-center justify-center border px-3 text-sm transition-colors disabled:opacity-40 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}
