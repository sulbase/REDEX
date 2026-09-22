import { formatPrice, taxLabel } from "@/lib/directus";
import { type CartLine } from "@/lib/cart";
import { quoteLine } from "@/lib/pricing";
import { formatTaxRate, splitTax, taxBuckets } from "@/lib/tax";

export function buildOrderMessage({
  name,
  phone,
  email,
  documentId,
  lines,
}: {
  name: string;
  phone: string;
  email: string;
  documentId: string;
  lines: CartLine[];
}): string {
  const currency = lines[0]?.currency;
  const itemLines: string[] = [];

  for (const [index, line] of lines.entries()) {
    const quote = quoteLine(line.unitPrice, line.quantity, line.breaks);
    const included = line.taxIncluded !== false;
    const split = splitTax(quote.net, line.taxRate, included);
    const parts = [
      `${index + 1}. ${line.title}`,
      line.detail ? `   Medida: ${line.detail}` : null,
      line.sku ? `   SKU: ${line.sku}` : null,
      `   Cantidad: ${quote.quantity}`,
      `   Precio unitario: ${formatPrice(line.unitPrice, line.currency) || line.unitPrice}`,
      quote.discount > 0
        ? `   Descuento: −${formatPrice(quote.discount, line.currency)}`
        : null,
      `   Base: ${formatPrice(split.net, line.currency) || split.net} (${taxLabel(line.taxRate, included)})`,
      `   IVA ${formatTaxRate(line.taxRate)}%: ${formatPrice(split.tax, line.currency) || split.tax}`,
    ].filter(Boolean);
    itemLines.push(parts.join("\n"));
  }

  const summary = taxBuckets(
    lines.map((line) => {
      const quote = quoteLine(line.unitPrice, line.quantity, line.breaks);
      return {
        afterPromo: quote.net,
        rate: line.taxRate,
        included: line.taxIncluded !== false,
      };
    }),
  );

  return [
    "Pedido REDEX",
    "",
    "Datos del cliente",
    `Nombre: ${name}`,
    `Teléfono: ${phone}`,
    `Correo: ${email}`,
    `Cédula o RUC: ${documentId}`,
    "",
    "Productos solicitados",
    ...itemLines,
    "",
    `Subtotal: ${formatPrice(summary.net, currency) || summary.net}`,
    ...summary.byRate.map(
      (row) =>
        `IVA ${formatTaxRate(row.rate)}%: ${formatPrice(row.tax, currency) || row.tax}`,
    ),
    `Total: ${formatPrice(summary.payable, currency) || summary.payable}`,
  ].join("\n");
}

export function whatsappOrderHref(phoneHref: string | null, message: string): string | null {
  if (!phoneHref) return null;
  const sep = phoneHref.includes("?") ? "&" : "?";
  return `${phoneHref}${sep}text=${encodeURIComponent(message)}`;
}
