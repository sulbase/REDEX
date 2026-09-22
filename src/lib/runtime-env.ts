/** Cloudflare Workers bind secrets on the request env, not always on process.env. */
export function hydrateWorkerEnv(env: unknown) {
  if (!env || typeof env !== "object") return;
  const token = (env as { DIRECTUS_TOKEN?: unknown }).DIRECTUS_TOKEN;
  if (typeof token === "string" && token.trim()) {
    process.env.DIRECTUS_TOKEN = token.trim();
  }
}

export function runtimeEnv(name: string): string | undefined {
  try {
    const fromProcess = process.env[name]?.trim();
    if (fromProcess) return fromProcess;
  } catch {
    /* Cloudflare may throw if process is accessed too early */
  }
  try {
    const fromBinding = (
      globalThis as { __env__?: Record<string, unknown> }
    ).__env__?.[name];
    if (typeof fromBinding === "string" && fromBinding.trim()) {
      return fromBinding.trim();
    }
  } catch {
    /* ignore */
  }
  return undefined;
}
