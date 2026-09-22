# REDEX

Importado desde [`sulbase/weather-heart-interface`](https://github.com/sulbase/weather-heart-interface).

Tenant: `redex` · Directus: `https://zyklo.sulbase.com`

Cloudflare: `DIRECTUS_TOKEN` must be a **runtime secret**
(`Workers → redex → Settings → Variables and Secrets`, Encrypted).
Build variables are not available when placing orders.

```bash
cd stores/REDEX
npm install
npm run dev
```

- Home: http://localhost:8080/
- Catálogo: http://localhost:8080/products (API Directus, filtro por categoría)
- Solutions: http://localhost:8080/solutions
- About: http://localhost:8080/about
- Contact: http://localhost:8080/contact
