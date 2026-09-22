import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { PageHero } from "@/components/wefa/PageHero";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { loadCatalog } from "@/lib/catalog";
import { datasheetAssetUrl, datasheetFileIds, type Product } from "@/lib/directus";
import heroDownloads from "@/assets/downloads.webp";

type DatasheetLink = {
  productId: string;
  name: string;
  href: string;
  label: string;
};

type DatasheetGroup = {
  category: string;
  links: DatasheetLink[];
};

function datasheetGroups(products: Product[]): DatasheetGroup[] {
  const byCategory = new Map<string, DatasheetLink[]>();

  for (const product of products) {
    if (product.datasheet_enabled === false) continue;
    const fileIds = datasheetFileIds(product);
    if (fileIds.length === 0) continue;

    const category = product.category?.name?.trim() || "Otros";
    const links = byCategory.get(category) ?? [];
    fileIds.forEach((id, index) => {
      links.push({
        productId: product.id,
        name: product.name,
        href: datasheetAssetUrl(id),
        label:
          fileIds.length > 1
            ? `${product.name} — ficha ${index + 1}`
            : product.name,
      });
    });
    byCategory.set(category, links);
  }

  return [...byCategory.entries()]
    .sort(([a], [b]) => {
      if (a === "Otros") return 1;
      if (b === "Otros") return -1;
      return a.localeCompare(b, "es");
    })
    .map(([category, links]) => ({
      category,
      links: links.sort((a, b) => a.label.localeCompare(b.label, "es")),
    }));
}

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Descargas — REDEX" },
      {
        name: "description",
        content:
          "Fichas técnicas de tubería y accesorios REDEX, agrupadas por categoría.",
      },
    ],
  }),
  loader: () => loadCatalog(),
  component: DownloadsPage,
});

function DownloadsPage() {
  const { products } = Route.useLoaderData();
  const groups = datasheetGroups(products);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero eyebrow="REDEX" title="Descargas" image={heroDownloads} alt="" />

      <main className="mx-auto w-full max-w-[1100px] px-5 pb-24 pt-12 lg:px-10">
        <RiseIn>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Enlaces a las fichas técnicas de los productos que tienen foto publicada. Cada
            enlace abre la imagen de la ficha.
          </p>
        </RiseIn>

        {groups.length === 0 ? (
          <RiseIn className="mt-14">
            <p className="text-muted-foreground">
              Todavía no hay fichas técnicas con foto publicadas.
            </p>
          </RiseIn>
        ) : (
          <div className="mt-14 space-y-14">
            {groups.map((group, i) => (
              <RiseIn key={group.category} delay={riseStagger(i, 80, 8)}>
                <section>
                  <h2 className="border-b border-border pb-3 text-xl font-semibold uppercase tracking-[0.06em] text-primary sm:text-2xl">
                    {group.category}
                  </h2>
                  <ul className="mt-5 space-y-2">
                    {group.links.map((link) => (
                      <li key={`${link.productId}-${link.href}`}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-base text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              </RiseIn>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
