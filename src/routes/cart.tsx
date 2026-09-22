import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Header } from "@/components/wefa/Header";
import { Footer } from "@/components/wefa/Footer";
import { PageHero } from "@/components/wefa/PageHero";
import { RiseIn, riseStagger } from "@/components/wefa/RiseIn";
import { formatPrice, taxLabel, type StorefrontPayments } from "@/lib/directus";
import { cartTaxSummary, linePayable, useCart, CART_MAX_QTY } from "@/lib/cart";
import { quoteLine } from "@/lib/pricing";
import { formatTaxRate } from "@/lib/tax";
import { placeOrder } from "@/lib/place-order";
import { buildOrderMessage, whatsappOrderHref } from "@/lib/order-message";
import { useStorefront } from "@/lib/storefront";
import heroImg from "@/assets/hero-bathroom.webp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Carrito — REDEX" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQuantity, removeLine, clear } = useCart();
  const { whatsappHref, payments } = useStorefront();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderWhatsapp, setOrderWhatsapp] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [website, setWebsite] = useState("");

  const currency = lines[0]?.currency;
  const summary = cartTaxSummary(lines);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const message = buildOrderMessage({
        name,
        phone,
        email,
        documentId,
        lines,
      });
      const wa = whatsappOrderHref(whatsappHref, message);
      await placeOrder({
        data: {
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          customer_document: documentId,
          website,
          started_at: startedAt,
          lines: lines.map((line) => ({
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
          })),
        },
      });
      clear();
      setOrderMessage(message);
      setOrderWhatsapp(wa);
      setSent(true);
      if (wa) window.open(wa, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el pedido");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageHero eyebrow="REDEX" title="Carrito" image={heroImg} alt="" />
      <main className="mx-auto max-w-[1100px] px-5 py-12 lg:px-10">
        {sent ? (
          <RiseIn className="mt-10 max-w-2xl">
            <p className="text-lg">Pedido enviado.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Lo vas a ver en el panel como un pedido pendiente.
            </p>
            {orderWhatsapp ? (
              <a
                href={orderWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center bg-[#25D366] px-5 py-2.5 text-sm font-medium uppercase tracking-wide text-white"
              >
                Enviar detalle por WhatsApp
              </a>
            ) : null}
            {orderMessage ? (
              <pre className="mt-6 overflow-x-auto whitespace-pre-wrap border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
                {orderMessage}
              </pre>
            ) : null}
            <Link to="/products" className="mt-6 inline-block text-primary">
              Seguir comprando
            </Link>
          </RiseIn>
        ) : lines.length === 0 ? (
          <RiseIn className="mt-10">
            <p className="text-muted-foreground">El carrito está vacío.</p>
            <Link to="/products" className="mt-6 inline-block text-primary">
              Ver productos
            </Link>
          </RiseIn>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ul className="flex flex-col gap-4">
              {lines.map((line, i) => {
                const quote = quoteLine(line.unitPrice, line.quantity, line.breaks);
                return (
                  <RiseIn
                    key={line.id}
                    as="li"
                    delay={riseStagger(i)}
                    className="grid gap-3 border border-border p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
                  >
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="h-20 w-20 bg-white object-contain"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center bg-muted text-[10px] uppercase tracking-widest text-muted-foreground">
                        REDEX
                      </div>
                    )}
                    <div>
                      <Link
                        to="/products/$slug"
                        params={{ slug: line.slug }}
                        className="text-sm font-medium uppercase hover:text-primary"
                      >
                        {line.title}
                      </Link>
                      {line.sku ? (
                        <p className="text-xs text-muted-foreground">{line.sku}</p>
                      ) : null}
                      {line.detail ? (
                        <p className="text-xs text-muted-foreground">{line.detail}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatPrice(line.unitPrice, line.currency)}{" "}
                        {taxLabel(line.taxRate, line.taxIncluded !== false)}
                      </p>
                    </div>
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        className="px-3 py-2"
                        onClick={() => setQuantity(line.id, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-2"
                        disabled={line.quantity >= CART_MAX_QTY}
                        onClick={() => setQuantity(line.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">
                        {formatPrice(
                          linePayable(
                            quote.net,
                            line.taxRate,
                            line.taxIncluded !== false,
                          ),
                          line.currency,
                        )}
                      </p>
                      {quote.discount > 0 ? (
                        <p className="text-xs text-primary">
                          −{formatPrice(quote.discount, line.currency)}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="mt-2 text-xs text-muted-foreground hover:text-primary"
                      >
                        Quitar
                      </button>
                    </div>
                  </RiseIn>
                );
              })}
            </ul>
            <RiseIn delay={riseStagger(1)}>
            <form onSubmit={submit} className="relative border border-border p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">
                Datos del pedido
              </h2>
              <label className="mt-4 block text-sm">
                Nombre
                <input
                  required
                  autoComplete="name"
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-1 w-full border border-border bg-transparent px-3 py-2"
                />
              </label>
              <label className="mt-3 block text-sm">
                Teléfono
                <input
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  pattern="\d{10}"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-1 w-full border border-border bg-transparent px-3 py-2"
                />
              </label>
              <label className="mt-3 block text-sm">
                Correo
                <input
                  required
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1 w-full border border-border bg-transparent px-3 py-2"
                />
              </label>
              <label className="mt-3 block text-sm">
                Cédula o RUC
                <input
                  required
                  inputMode="numeric"
                  maxLength={13}
                  pattern="\d{10}|\d{13}"
                  value={documentId}
                  onChange={(event) =>
                    setDocumentId(event.target.value.replace(/\D/g, "").slice(0, 13))
                  }
                  className="mt-1 w-full border border-border bg-transparent px-3 py-2"
                />
              </label>
              <div className="absolute left-[-10000px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Sitio web
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-5 flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(summary.net, currency)}</span>
              </div>
              {summary.byRate.map((row) => (
                <div
                  key={row.rate}
                  className="mt-1 flex items-center justify-between text-sm text-muted-foreground"
                >
                  <span>IVA {formatTaxRate(row.rate)}%</span>
                  <span className="tabular-nums">{formatPrice(row.tax, currency)}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(summary.payable, currency)}</span>
              </div>
              {error ? <p className="mt-3 text-sm text-primary">{error}</p> : null}
              <button
                type="submit"
                disabled={pending}
                className="mt-5 w-full bg-primary px-4 py-3 text-sm font-medium uppercase tracking-wide text-primary-foreground disabled:opacity-60"
              >
                {pending ? "Enviando…" : "Enviar pedido"}
              </button>
            </form>
            <PaymentDetails payments={payments} />
            </RiseIn>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function PaymentDetails({ payments }: { payments: StorefrontPayments }) {
  const showTransfer = payments.transferEnabled && payments.accounts.length > 0;
  const showCash = payments.cashEnabled;
  if (!showTransfer && !showCash) return null;

  return (
    <div className="mt-5 border border-border p-5">
      {showTransfer ? (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em]">
            Transferencia
          </h3>
          <ul className="mt-4 space-y-4">
            {payments.accounts.map((account, index) => (
              <li key={`${account.accountNumber}-${index}`} className="text-sm">
                {account.bank ? (
                  <p className="font-medium">{account.bank}</p>
                ) : (
                  <p className="font-medium">Cuenta {index + 1}</p>
                )}
                {account.accountHolder ? (
                  <p className="mt-1 text-muted-foreground">
                    Titular: {account.accountHolder}
                  </p>
                ) : null}
                {account.accountNumber ? (
                  <p className="text-muted-foreground">
                    Cuenta: {account.accountNumber}
                  </p>
                ) : null}
                <p className="text-muted-foreground">
                  Tipo: {account.accountType === "checking" ? "Corriente" : "Ahorros"}
                </p>
              </li>
            ))}
          </ul>
          {payments.instructions ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {payments.instructions}
            </p>
          ) : null}
        </div>
      ) : null}

      {showCash ? (
        <div className={showTransfer ? "mt-5 border-t border-border pt-5" : ""}>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em]">
            Efectivo
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Aceptamos pago en efectivo, en retiro o contraentrega.
          </p>
        </div>
      ) : null}
    </div>
  );
}
