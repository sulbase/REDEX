import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, X } from "lucide-react";

import { formatPrice } from "@/lib/directus";
import { quoteLine, type PriceBreak } from "@/lib/pricing";
import { formatTaxRate, splitTax, taxBuckets } from "@/lib/tax";

const STORAGE_KEY = "redex-cart";
const SEEN_KEY = "redex-cart-seen";
export const CART_MAX_QTY = 999;

export type CartLine = {
  id: string;
  productId: string;
  variantId: string | null;
  slug: string;
  title: string;
  detail?: string | null;
  sku: string | null;
  imageUrl: string | null;
  unitPrice: number;
  currency: string | null;
  taxRate: number;
  taxIncluded?: boolean;
  quantity: number;
  breaks: PriceBreak[];
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  addLine: (line: CartLine) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartLine[]) : [];
    return Array.isArray(parsed) ? parsed.filter((row) => row && row.id) : [];
  } catch {
    return [];
  }
}

export function lineTax(
  afterPromo: number,
  rate: number,
  included = true,
): number {
  return splitTax(afterPromo, rate, included).tax;
}

export function linePayable(
  afterPromo: number,
  rate: number,
  included = true,
): number {
  return splitTax(afterPromo, rate, included).payable;
}

export function cartTaxSummary(lines: CartLine[]) {
  return taxBuckets(
    lines.map((line) => {
      const quote = quoteLine(line.unitPrice, line.quantity, line.breaks);
      return {
        afterPromo: quote.net,
        rate: line.taxRate,
        included: line.taxIncluded !== false,
      };
    }),
  );
}

function clampQty(quantity: number): number {
  const next = Math.floor(quantity) || 1;
  return Math.min(CART_MAX_QTY, Math.max(1, next));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(readStored());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      lines,
      count,
      open,
      setOpen,
      addLine: (line) => {
        setLines((prev) => {
          const found = prev.find((row) => row.id === line.id);
          const adding = clampQty(line.quantity);
          if (!found) return [...prev, { ...line, quantity: adding }];
          return prev.map((row) =>
            row.id === line.id
              ? { ...line, quantity: clampQty(row.quantity + adding) }
              : row,
          );
        });
        if (typeof window !== "undefined" && !window.localStorage.getItem(SEEN_KEY)) {
          window.localStorage.setItem(SEEN_KEY, "1");
          setOpen(true);
        }
      },
      setQuantity: (id, quantity) => {
        const next = clampQty(quantity);
        setLines((prev) =>
          prev.map((row) => (row.id === id ? { ...row, quantity: next } : row)),
        );
      },
      removeLine: (id) => {
        setLines((prev) => prev.filter((row) => row.id !== id));
      },
      clear: () => setLines([]),
    };
  }, [lines, open]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      aria-label="Carrito"
      onClick={() => setOpen(true)}
      className="relative text-primary"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
          {count > 99 ? "99" : count}
        </span>
      ) : null}
    </button>
  );
}

function CartDrawer() {
  const { open, setOpen, lines, setQuantity, removeLine } = useCart();
  if (!open) return null;

  const currency = lines[0]?.currency;
  const summary = cartTaxSummary(lines);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">
            Carrito
          </h2>
          <button type="button" aria-label="Cerrar" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-muted-foreground">El carrito está vacío.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => {
                const quote = quoteLine(line.unitPrice, line.quantity, line.breaks);
                return (
                  <li key={line.id} className="border-b border-border pb-4">
                    <div className="flex items-start gap-3">
                      {line.imageUrl ? (
                        <img
                          src={line.imageUrl}
                          alt=""
                          className="h-16 w-16 shrink-0 bg-white object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-muted text-[10px] uppercase tracking-widest text-muted-foreground">
                          REDEX
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium uppercase">{line.title}</p>
                            {line.sku ? (
                              <p className="text-xs text-muted-foreground">{line.sku}</p>
                            ) : null}
                            {line.detail ? (
                              <p className="text-xs text-muted-foreground">{line.detail}</p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="text-xs text-muted-foreground hover:text-primary"
                          >
                            Quitar
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="flex items-center border border-border">
                            <button
                              type="button"
                              className="px-3 py-1"
                              onClick={() => setQuantity(line.id, line.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center text-sm tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              className="px-3 py-1"
                              disabled={line.quantity >= CART_MAX_QTY}
                              onClick={() => setQuantity(line.id, line.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium tabular-nums">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-border px-5 py-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatPrice(summary.net, currency)}</span>
          </div>
          {summary.byRate.map((row) => (
            <div
              key={row.rate}
              className="mb-1 flex items-center justify-between text-sm text-muted-foreground"
            >
              <span>IVA {formatTaxRate(row.rate)}%</span>
              <span className="tabular-nums">{formatPrice(row.tax, currency)}</span>
            </div>
          ))}
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>Total</span>
            <span className="font-semibold tabular-nums">
              {formatPrice(summary.payable, currency)}
            </span>
          </div>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="block bg-primary px-4 py-3 text-center text-sm font-medium uppercase tracking-wide text-primary-foreground"
          >
            Ver carrito
          </Link>
        </div>
      </aside>
    </div>
  );
}
