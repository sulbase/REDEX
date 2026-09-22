import {
  getRequestHeader,
  getRequestHost,
  getRequestIP,
} from "@tanstack/react-start/server";

const MIN_FORM_MS = 2_500;
const MAX_FORM_MS = 1000 * 60 * 60 * 12;
const IP_COOLDOWN_MS = 40_000;
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_WINDOW_MAX = 4;
const IDENTITY_COOLDOWN_MS = 2 * 60 * 1000;
const MAX_LINES = 40;

const SCRIPT_UA =
  /\b(python-requests|python-urllib|httpx|aiohttp|scrapy|mechanize|libwww-perl|go-http-client|okhttp|postmanruntime|insomnia)\b/i;

type Bucket = { times: number[] };

const buckets = new Map<string, Bucket>();
const inflight = new Set<string>();

function prune(now: number) {
  if (buckets.size < 400) return;
  for (const [key, bucket] of buckets) {
    bucket.times = bucket.times.filter((t) => now - t < IP_WINDOW_MS);
    if (!bucket.times.length) buckets.delete(key);
  }
}

function lastHit(key: string): number | undefined {
  const times = buckets.get(key)?.times;
  return times?.length ? times[times.length - 1] : undefined;
}

function hitsInWindow(key: string, now: number, windowMs: number): number {
  const bucket = buckets.get(key);
  if (!bucket) return 0;
  bucket.times = bucket.times.filter((t) => now - t < windowMs);
  if (!bucket.times.length) buckets.delete(key);
  return bucket.times.length;
}

function record(key: string, now: number) {
  const bucket = buckets.get(key) ?? { times: [] };
  bucket.times.push(now);
  buckets.set(key, bucket);
}

function clientIp(): string {
  return (
    getRequestIP({ xForwardedFor: true }) ||
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-real-ip") ||
    "unknown"
  );
}

function originAllowed(): boolean {
  const host = getRequestHost({ xForwardedHost: true }).toLowerCase();
  if (!host) return true;
  const origin = (getRequestHeader("origin") || "").toLowerCase();
  const referer = (getRequestHeader("referer") || "").toLowerCase();
  const matches = (value: string) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      return url.host.toLowerCase() === host;
    } catch {
      return value.includes(host);
    }
  };
  if (origin) return matches(origin);
  if (referer) return matches(referer);
  return false;
}

export function assertOrderGuard(input: {
  website?: string | null;
  started_at?: number | null;
  customer_phone: string;
  customer_email: string;
  customer_document: string;
  lineCount: number;
}) {
  const now = Date.now();
  prune(now);

  if (String(input.website || "").trim()) {
    throw new Error("No se pudo enviar el pedido");
  }
  if (input.lineCount > MAX_LINES) {
    throw new Error("El pedido tiene demasiadas líneas");
  }

  const started = Number(input.started_at);
  if (!Number.isFinite(started) || started <= 0) {
    throw new Error("Recarga la página e intenta de nuevo");
  }
  const age = now - started;
  if (age < MIN_FORM_MS) {
    throw new Error("Espera un segundo e intenta de nuevo");
  }
  if (age > MAX_FORM_MS) {
    throw new Error("La sesión del formulario expiró. Recarga la página");
  }

  const ua = getRequestHeader("user-agent") || "";
  if (!ua.trim() || SCRIPT_UA.test(ua)) {
    throw new Error("No se pudo enviar el pedido");
  }
  if (!originAllowed()) {
    throw new Error("No se pudo enviar el pedido");
  }

  const ip = clientIp();
  const ipKey = `ip:${ip}`;
  const phoneKey = `ph:${input.customer_phone}`;
  const emailKey = `em:${input.customer_email}`;
  const docKey = `doc:${input.customer_document}`;

  if (inflight.has(ipKey)) {
    throw new Error("El pedido ya se está enviando");
  }

  const ipLast = lastHit(ipKey);
  if (ipLast && now - ipLast < IP_COOLDOWN_MS) {
    throw new Error("Espera un momento antes de enviar otro pedido");
  }
  if (hitsInWindow(ipKey, now, IP_WINDOW_MS) >= IP_WINDOW_MAX) {
    throw new Error("Demasiados pedidos. Intenta más tarde");
  }
  for (const key of [phoneKey, emailKey, docKey]) {
    const last = lastHit(key);
    if (last && now - last < IDENTITY_COOLDOWN_MS) {
      throw new Error("Ya registramos un pedido reciente con esos datos");
    }
  }

  inflight.add(ipKey);
  return {
    commit() {
      record(ipKey, now);
      record(phoneKey, now);
      record(emailKey, now);
      record(docKey, now);
      inflight.delete(ipKey);
    },
    abort() {
      inflight.delete(ipKey);
    },
  };
}
