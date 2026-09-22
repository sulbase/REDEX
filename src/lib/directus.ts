export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductVariant = {
  id: string;
  status?: string | null;
  sort?: number | null;
  sku?: string | null;
  price?: string | number | null;
  tax_rate?: string | number | null;
  tax_included?: boolean | null;
  attributes?: Record<string, unknown> | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string | null;
  price?: string | number | null;
  tax_rate?: string | number | null;
  tax_included?: boolean | null;
  currency?: string | null;
  datasheet_enabled?: boolean | null;
  datasheet_url?: string | null;
  datasheet_images?: string[] | null;
  category?: Category | null;
  images?: Array<{
    id?: string;
    directus_files_id?: { id: string } | string | null;
  }> | null;
  variants?: ProductVariant[] | null;
};

export type DiscountTier = {
  id?: string;
  sort?: number | null;
  min_quantity?: number | null;
  min_subtotal?: number | string | null;
  type?: "percentage" | "fixed" | string | null;
  value: number | string;
};

export type StoreDiscount = {
  id: string;
  name: string;
  status?: string | null;
  type: "percentage" | "fixed" | string;
  value: number | string;
  applies_to: "variant" | "product" | "category" | string;
  threshold_type?: "quantity" | "money" | string | null;
  min_quantity?: number | null;
  min_subtotal?: number | string | null;
  target_ids?: string[] | string | null;
  product?: string | { id: string } | null;
  variant?: string | { id: string } | null;
  category?: string | { id: string } | null;
  starts_at?: string | null;
  ends_at?: string | null;
  tiers?: DiscountTier[] | null;
  tier_breaks?: DiscountTier[] | null;
};

const DIRECTUS_URL = (
  import.meta.env.VITE_DIRECTUS_URL || "https://zyklo.sulbase.com"
).replace(/\/$/, "");

const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || "redex";

const SKIP_ATTR_KEYS = new Set(["is_physical", "taxable", "tax_included"]);

/** Static token only on the server (SSR/loader). Never expose via VITE_*. */
function serverDirectusToken(): string | undefined {
  try {
    const tok = process.env.DIRECTUS_TOKEN?.trim();
    return tok || undefined;
  } catch {
    return undefined;
  }
}

function buildUrl(path: string, params: Record<string, string>) {
  const url = new URL(`${DIRECTUS_URL}${path}`);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
}

async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = serverDirectusToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(buildUrl(path, params), { headers });
  if (!res.ok) {
    throw new Error(`Directus ${res.status}: ${path}`);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export async function fetchPublishedCategories(): Promise<Category[]> {
  return getJson<Category[]>("/items/categories", {
    "filter[status][_eq]": "published",
    "filter[tenant][slug][_eq]": TENANT_SLUG,
    fields: "id,name,slug",
    sort: "sort,name",
    limit: "-1",
  });
}

export async function fetchPublishedProducts(): Promise<Product[]> {
  return getJson<Product[]>("/items/products", {
    "filter[status][_eq]": "published",
    "filter[tenant][slug][_eq]": TENANT_SLUG,
    fields:
      "id,name,slug,sku,description,price,tax_rate,tax_included,currency,datasheet_enabled,datasheet_url,datasheet_images,category.id,category.name,category.slug,images.id,images.directus_files_id.id,variants.id,variants.status,variants.sort,variants.sku,variants.price,variants.tax_rate,variants.attributes",
    sort: "sort,name",
    limit: "-1",
  });
}

function discountIsLive(d: StoreDiscount): boolean {
  if (d.status && d.status !== "active") return false;
  const now = Date.now();
  if (d.starts_at && Date.parse(d.starts_at) > now) return false;
  if (d.ends_at && Date.parse(d.ends_at) < now) return false;
  return true;
}

const DISCOUNT_FIELDS =
  "id,name,status,type,value,applies_to,threshold_type,min_quantity,min_subtotal,target_ids,product,variant,category,starts_at,ends_at,tier_breaks";
const DISCOUNT_FIELDS_WITH_TIERS = `${DISCOUNT_FIELDS},tiers.id,tiers.sort,tiers.min_quantity,tiers.min_subtotal,tiers.type,tiers.value`;

export async function fetchActiveDiscounts(): Promise<StoreDiscount[]> {
  const params = {
    "filter[status][_eq]": "active",
    "filter[tenant][slug][_eq]": TENANT_SLUG,
    sort: "-date_updated",
    limit: "-1",
  };
  try {
    const rows = await getJson<StoreDiscount[]>("/items/discounts", {
      ...params,
      fields: DISCOUNT_FIELDS_WITH_TIERS,
    });
    return (Array.isArray(rows) ? rows : []).filter(discountIsLive);
  } catch {
    try {
      const rows = await getJson<StoreDiscount[]>("/items/discounts", {
        ...params,
        fields: DISCOUNT_FIELDS,
      });
      return (Array.isArray(rows) ? rows : []).filter(discountIsLive);
    } catch {
      return [];
    }
  }
}

export type StoreSocialLink = {
  key: string;
  label: string;
  href: string;
};

export type StorefrontVideo = {
  title: string | null;
  embedUrl: string;
};

export type BankAccount = {
  bank: string;
  accountHolder: string;
  accountNumber: string;
  accountType: "savings" | "checking";
};

export type StorefrontPayments = {
  transferEnabled: boolean;
  cashEnabled: boolean;
  instructions: string | null;
  accounts: BankAccount[];
};

export type StorefrontContact = {
  name: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  whatsappHref: string | null;
  address: string | null;
  hours: string | null;
  social: StoreSocialLink[];
  categories: Category[];
  welcomeVideo: StorefrontVideo | null;
  payments: StorefrontPayments;
};

export const EMPTY_PAYMENTS: StorefrontPayments = {
  transferEnabled: false,
  cashEnabled: false,
  instructions: null,
  accounts: [],
};

export const EMPTY_STOREFRONT: StorefrontContact = {
  name: "REDEX",
  tagline: null,
  email: null,
  phone: null,
  whatsapp: null,
  whatsappHref: null,
  address: null,
  hours: null,
  social: [],
  categories: [],
  welcomeVideo: null,
  payments: EMPTY_PAYMENTS,
};

const STORE_NETWORKS = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X" },
  { key: "pinterest", label: "Pinterest" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

export function resolveVideoEmbed(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const isYoutube = /(youtube\.com|youtu\.be)/i.test(trimmed);
  const isVimeo = /vimeo\.com/i.test(trimmed);
  if (!isYoutube && !isVimeo) return null;

  try {
    const u = new URL(trimmed);
    if (isYoutube) {
      let id: string | null = null;
      if (u.hostname.includes("youtu.be")) {
        id = u.pathname.replace(/^\//, "").split("/")[0] || null;
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2] || null;
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2] || null;
      } else {
        id = u.searchParams.get("v");
      }
      if (!id || !/^[\w-]{6,}$/.test(id)) return null;
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts.find((p) => /^\d+$/.test(p)) || null;
    if (!id) return null;
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
}

async function fetchWelcomeVideo(): Promise<StorefrontVideo | null> {
  try {
    const rows = await getJson<
      Array<{ title?: string | null; url?: string | null; sort?: number | null }>
    >("/items/videos", {
      "filter[status][_eq]": "published",
      "filter[slot][_eq]": "welcome",
      "filter[tenant][slug][_eq]": TENANT_SLUG,
      fields: "title,url,sort",
      sort: "sort",
      limit: "1",
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    const embedUrl = resolveVideoEmbed(row?.url);
    if (!embedUrl) return null;
    const title = String(row?.title || "").trim();
    return { title: title || null, embedUrl };
  } catch {
    return null;
  }
}

function normalizeSocialUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w.-]+\.[\w.-]+/.test(trimmed)) return `https://${trimmed}`;
  return null;
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function parsePayments(raw: unknown): StorefrontPayments {
  const settings = asRecord(raw);
  const payments = asRecord(settings.payments);
  const accounts: BankAccount[] = [];
  const list = Array.isArray(payments.accounts) ? payments.accounts : [];
  for (const row of list) {
    const item = asRecord(row);
    const bank = String(item.bank || "").trim();
    const accountHolder = String(item.account_holder || "").trim();
    const accountNumber = String(item.account_number || "").trim();
    if (!bank && !accountHolder && !accountNumber) continue;
    accounts.push({
      bank,
      accountHolder,
      accountNumber,
      accountType: String(item.account_type || "") === "checking" ? "checking" : "savings",
    });
    if (accounts.length >= 4) break;
  }
  if (!accounts.length) {
    const legacy = asRecord(payments.transfer);
    const bank = String(legacy.bank || "").trim();
    const accountHolder = String(legacy.account_holder || "").trim();
    const accountNumber = String(legacy.account_number || "").trim();
    if (bank || accountHolder || accountNumber) {
      accounts.push({
        bank,
        accountHolder,
        accountNumber,
        accountType: String(legacy.account_type || "") === "checking" ? "checking" : "savings",
      });
    }
  }
  const flag = (value: unknown, fallback: boolean) => {
    if (value === true || value === "true" || value === "1" || value === "on") return true;
    if (value === false || value === "false" || value === "0" || value === "off") return false;
    return fallback;
  };
  const instructions = String(payments.instructions || asRecord(payments.transfer).instructions || "").trim();
  return {
    transferEnabled: flag(payments.transfer_enabled, accounts.length > 0),
    cashEnabled: flag(payments.cash_enabled, false),
    instructions: instructions || null,
    accounts,
  };
}

export async function fetchStorefrontContact(): Promise<StorefrontContact> {
  const [categories, welcomeVideo] = await Promise.all([
    fetchPublishedCategories().catch(() => [] as Category[]),
    fetchWelcomeVideo(),
  ]);
  try {
    const tenantFields =
      "name,tagline,email,phone,whatsapp,address,hours,product_schema";
    const tenantParams = {
      "filter[slug][_eq]": TENANT_SLUG,
      limit: "1",
    };
    let rows: Array<{
      name?: string | null;
      tagline?: string | null;
      email?: string | null;
      phone?: string | null;
      whatsapp?: string | null;
      address?: string | null;
      hours?: string | null;
      product_schema?: unknown;
      settings?: unknown;
    }>;
    try {
      rows = await getJson("/items/tenants", {
        ...tenantParams,
        fields: `${tenantFields},settings`,
      });
    } catch {
      rows = await getJson("/items/tenants", {
        ...tenantParams,
        fields: tenantFields,
      });
    }
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return { ...EMPTY_STOREFRONT, categories, welcomeVideo };
    let schema = row.product_schema;
    if (typeof schema === "string") {
      try {
        schema = JSON.parse(schema) as unknown;
      } catch {
        schema = null;
      }
    }
    const links =
      schema && typeof schema === "object" && !Array.isArray(schema)
        ? (schema as { social_links?: unknown }).social_links
        : null;
    const social: StoreSocialLink[] = [];
    if (links && typeof links === "object" && !Array.isArray(links)) {
      const record = links as Record<string, unknown>;
      for (const net of STORE_NETWORKS) {
        const raw = record[net.key];
        if (typeof raw !== "string") continue;
        const href = normalizeSocialUrl(raw);
        if (href) social.push({ key: net.key, label: net.label, href });
      }
    }
    const digits = String(row.whatsapp || "").replace(/\D/g, "");
    const text = (value: string | null | undefined) => {
      const trimmed = String(value || "").trim();
      return trimmed || null;
    };
    return {
      name: text(row.name) || "REDEX",
      tagline: text(row.tagline),
      email: text(row.email),
      phone: text(row.phone),
      whatsapp: text(row.whatsapp),
      whatsappHref: digits.length >= 8 ? `https://wa.me/${digits}` : null,
      address: text(row.address),
      hours: text(row.hours),
      social,
      categories,
      welcomeVideo,
      payments: parsePayments(row.settings),
    };
  } catch {
    return { ...EMPTY_STOREFRONT, categories, welcomeVideo };
  }
}

export function productImageUrl(product: Product): string | null {
  const first = product.images?.[0]?.directus_files_id;
  if (!first) return null;
  const id = typeof first === "string" ? first : first.id;
  if (!id) return null;
  // fit=contain pads with black unless Sharp gets an explicit background via
  // `transforms`. Query `background=` is ignored on this Directus.
  const transforms = encodeURIComponent(
    JSON.stringify([
      [
        "resize",
        {
          width: 1200,
          height: 1200,
          fit: "contain",
          background: "#ffffff",
        },
      ],
    ]),
  );
  return `${DIRECTUS_URL}/assets/${id}?transforms=${transforms}&quality=85`;
}

export function datasheetFileIds(product: Product): string[] {
  const raw = product.datasheet_images;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .slice(0, 2);
}

export function datasheetAssetUrl(fileId: string): string {
  return `${DIRECTUS_URL}/assets/${fileId}`;
}

export function formatPrice(
  price?: string | number | null,
  currency?: string | null,
): string | null {
  if (price == null || price === "") return null;
  const amount = typeof price === "string" ? Number(price) : price;
  const code = currency || "USD";
  if (Number.isNaN(amount)) return `${price} ${code}`;
  try {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

export function publishedVariants(product: Product): ProductVariant[] {
  return [...(product.variants || [])]
    .filter((v) => !v.status || v.status === "published")
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
}

export function variantAttrEntries(
  variant: ProductVariant,
): Array<[string, string]> {
  const attrs = variant.attributes;
  if (!attrs || typeof attrs !== "object") return [];
  return Object.entries(attrs)
    .filter(([key, value]) => !SKIP_ATTR_KEYS.has(key) && value != null && value !== "")
    .map(([key, value]) => [key, String(value)]);
}

export function specColumns(variants: ProductVariant[]): string[] {
  const keys: string[] = [];
  for (const variant of variants) {
    for (const [key] of variantAttrEntries(variant)) {
      if (!keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

export function variantAttrMap(
  variant: ProductVariant,
): Record<string, string> {
  return Object.fromEntries(variantAttrEntries(variant));
}

export function variantLabel(variant: ProductVariant): string {
  const parts = variantAttrEntries(variant).map(([, value]) => value);
  if (parts.length) return parts.join(" · ");
  return variant.sku || "Standard";
}

export function optionValues(
  variants: ProductVariant[],
  column: string,
): string[] {
  const values: string[] = [];
  for (const variant of variants) {
    const value = variantAttrMap(variant)[column];
    if (value && !values.includes(value)) values.push(value);
  }
  return values;
}

function parseTaxRate(raw?: string | number | null): number | null {
  if (raw == null || raw === "") return null;
  const amount = typeof raw === "string" ? Number(raw) : raw;
  if (Number.isNaN(amount)) return null;
  return amount;
}

/** Variant rate if set; otherwise the product rate. */
export function taxRateOf(
  product: Product,
  variant?: ProductVariant | null,
): number {
  const fromVariant = variant ? parseTaxRate(variant.tax_rate) : null;
  if (fromVariant != null) return fromVariant;
  return parseTaxRate(product.tax_rate) ?? 0;
}

export function taxIncludedOf(
  product: Product,
  variant?: ProductVariant | null,
): boolean {
  const attrs = variant?.attributes;
  if (attrs && typeof attrs === "object" && "tax_included" in attrs) {
    return attrs["tax_included"] !== false;
  }
  if (product.tax_included != null) return product.tax_included !== false;
  return true;
}

export function taxLabel(rate: number, included = true): string {
  const shown = Number.isInteger(rate)
    ? String(rate)
    : String(rate)
        .replace(/(\.\d*?)0+$/, "$1")
        .replace(/\.$/, "");
  if (rate <= 0) return "IVA 0%";
  return included ? `IVA ${shown}% incluido` : `+ IVA ${shown}%`;
}

export { DIRECTUS_URL, TENANT_SLUG };
