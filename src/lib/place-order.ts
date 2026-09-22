import { createServerFn } from "@tanstack/react-start";

import {
  fetchActiveDiscounts,
  fetchPublishedProducts,
  taxIncludedOf,
  taxRateOf,
} from "@/lib/directus";
import { priceBreaksFor, quoteLine } from "@/lib/pricing";
import { splitTax } from "@/lib/tax";
import { assertOrderGuard } from "@/lib/order-guard";
import { runtimeEnv } from "@/lib/runtime-env";

type OrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_document: string;
  website?: string;
  started_at?: number;
  lines: Array<{ productId: string; variantId: string | null; quantity: number }>;
};

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const placeOrder = createServerFn({ method: "POST" })
  .validator((input: OrderInput) => {
    const name = clip(String(input?.customer_name || ""), 80);
    const phone = String(input?.customer_phone || "").replace(/\D/g, "").slice(0, 10);
    const email = clip(String(input?.customer_email || ""), 120).toLowerCase();
    const document = String(input?.customer_document || "").replace(/\D/g, "").slice(0, 13);
    const lines = Array.isArray(input?.lines) ? input.lines : [];
    if (!name) throw new Error("El nombre es obligatorio");
    if (name.length < 3 || !NAME_RE.test(name)) throw new Error("El nombre no es válido");
    if (phone.length !== 10) throw new Error("El teléfono debe tener 10 dígitos");
    if (!email) throw new Error("El correo es obligatorio");
    if (!EMAIL_RE.test(email)) throw new Error("El correo no es válido");
    if (document.length !== 10 && document.length !== 13) {
      throw new Error("La cédula debe tener 10 dígitos o el RUC 13");
    }
    if (!lines.length) throw new Error("El carrito está vacío");
    if (lines.length > 40) throw new Error("El pedido tiene demasiadas líneas");
    const started_at = Number(input?.started_at);
    const website = String(input?.website || "");
    return {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      customer_document: document,
      website,
      started_at,
      lines,
    };
  })
  .handler(async ({ data }) => {
    const guard = assertOrderGuard({
      website: data.website,
      started_at: data.started_at,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      customer_document: data.customer_document,
      lineCount: data.lines.length,
    });
    try {
    const token = runtimeEnv("DIRECTUS_TOKEN");
    const base = (
      runtimeEnv("VITE_DIRECTUS_URL") || "https://zyklo.sulbase.com"
    ).replace(/\/$/, "");
    if (!token) {
      console.error("DIRECTUS_TOKEN missing at Worker runtime");
      throw new Error("No se pudo enviar el pedido");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const tenantRes = await fetch(
      `${base}/items/tenants?filter[slug][_eq]=redex&fields=id&limit=1`,
      { headers },
    );
    if (!tenantRes.ok) {
      console.error("Directus tenants lookup failed", tenantRes.status);
      throw new Error("No se pudo enviar el pedido");
    }
    const tenantJson = (await tenantRes.json()) as { data?: Array<{ id: string }> };
    const tenantId = tenantJson.data?.[0]?.id;
    if (!tenantId) throw new Error("No se pudo enviar el pedido");

    const [products, discounts] = await Promise.all([
      fetchPublishedProducts(),
      fetchActiveDiscounts(),
    ]);

    const items = [];
    let subtotal = 0;
    let taxTotal = 0;
    let payable = 0;
    let currency = "USD";

    for (const row of data.lines) {
      const product = products.find((item) => item.id === row.productId);
      if (!product) throw new Error("Un producto del carrito ya no está disponible");
      const variant = row.variantId
        ? (product.variants || []).find((item) => item.id === row.variantId)
        : null;
      if (row.variantId && !variant) {
        throw new Error("Una variante del carrito ya no está disponible");
      }
      const unit = Number(variant?.price ?? product.price ?? 0);
      if (!Number.isFinite(unit)) throw new Error("Un precio del carrito no es válido");
      if (product.currency) currency = product.currency;
      const quote = quoteLine(unit, Math.min(999, row.quantity), priceBreaksFor(product, variant, discounts));
      const taxRate = taxRateOf(product, variant);
      const included = taxIncludedOf(product, variant);
      const split = splitTax(quote.net, taxRate, included);
      subtotal += split.net;
      taxTotal += split.tax;
      payable += split.payable;
      items.push({
        tenant: tenantId,
        title: product.name,
        sku: variant?.sku || product.sku || null,
        quantity: quote.quantity,
        unit_price: unit,
        line_discount: quote.discount,
        line_total: split.net,
        tax_rate: taxRate,
        tax_amount: split.tax,
        product: product.id,
        variant: variant?.id || null,
        sort: items.length + 1,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    taxTotal = Math.round(taxTotal * 100) / 100;
    const total = Math.round(payable * 100) / 100;

    const created = await fetch(`${base}/items/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        tenant: tenantId,
        status: "pending",
        currency,
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || null,
        customer_document: data.customer_document || null,
        payment_status: "unpaid",
        payment_method: "transfer",
        fulfillment_type: "quote",
        discount_total: 0,
        subtotal,
        tax_total: taxTotal,
        total,
        items,
      }),
    });
    if (!created.ok) {
      const detail = await created.text().catch(() => "");
      console.error("Directus orders POST failed", created.status, detail.slice(0, 400));
      throw new Error("No se pudo enviar el pedido");
    }
    const body = (await created.json()) as { data?: { id?: string } };
    guard.commit();
    return { id: body.data?.id || "" };
    } catch (error) {
      guard.abort();
      throw error;
    }
  });
