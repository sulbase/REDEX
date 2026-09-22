import { createServerFn } from "@tanstack/react-start";

import {
  fetchActiveDiscounts,
  fetchPublishedCategories,
  fetchPublishedProducts,
  type Category,
  type Product,
  type StoreDiscount,
} from "@/lib/directus";

/** Always runs on the server so Directus is never called from the browser (CORS). */
export const loadCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    products: Product[];
    categories: Category[];
    discounts: StoreDiscount[];
  }> => {
    const [products, categories, discounts] = await Promise.all([
      fetchPublishedProducts(),
      fetchPublishedCategories(),
      fetchActiveDiscounts(),
    ]);
    return { products, categories, discounts };
  },
);

export const loadProductBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(
    async ({
      data: slug,
    }): Promise<{
      product: Product | null;
      similar: Product[];
      discounts: StoreDiscount[];
    }> => {
      const [products, discounts] = await Promise.all([
        fetchPublishedProducts(),
        fetchActiveDiscounts(),
      ]);
      const product = products.find((p) => p.slug === slug) || null;
      if (!product) return { product: null, similar: [], discounts };
      const sameCategory = products.filter(
        (p) =>
          p.id !== product.id &&
          p.category?.slug &&
          p.category.slug === product.category?.slug,
      );
      const rest = products.filter(
        (p) => p.id !== product.id && !sameCategory.some((s) => s.id === p.id),
      );
      return {
        product,
        similar: [...sameCategory, ...rest].slice(0, 4),
        discounts,
      };
    },
  );
