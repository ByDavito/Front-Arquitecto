# AGENTS.md

## Project Overview

React 19 + Vite 8 SPA (JSX, no TypeScript). Portfolio site for architects ("Estudio DSB") that displays works on an interactive map.

## Commands

- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — Production build to `dist/`
- `npm run lint` — ESLint (the only verification command available)
- No test suite exists. `test-db.cjs` and `test-options.cjs` are manual diagnostic scripts, not tests.

## Architecture

- **Routes**: `/` → HomePage (Hero + Map + Footer), `/obra/:id` → WorkDetailPage
- **API layer**: `src/services/api.js` — calls `https://api.obrabase.com`
- **Env vars**: `VITE_API_BASE_URL` (default `https://api.obrabase.com`), `VITE_API_HOST` (default `localhost:5173`)
- **Map library**: `@bydavito/map-core` — see `src/utils/geo.js` for data adapters (`workToMapPoint`, `formatCityData`)
- **State**: React Context (`MapLoadingContext`) manages map loading state + body scroll locking on home page

## Key Gotchas

- **API requires custom `x-domain` header** — cannot use standard `Host` header (browser blocks it, proxies break SSL). All fetch calls in `api.js` send `x-domain: <VITE_API_HOST>`.
- **Image URLs vary** — `formatImageUrl()` in `src/utils/geo.js` must handle absolute URLs, relative paths, and base64 strings. Don't assume a single format.
- **Map data adapters are in `src/utils/geo.js`** — `workToMapPoint()` and `formatCityData()` transform API responses to `@bydavito/map-core` format. Changes to API response shape require updating these.
- **CSS Modules** — components use `.module.css` files (e.g., `MapSection.module.css`, `WorkDetail.module.css`).
- **No TypeScript** — all files are `.js`/`.jsx`. ESLint uses `no-unused-vars` with pattern `^[A-Z_]` to allow unused components/constants.
- **`no-unused-vars` exception** — variables starting with uppercase or underscore are allowed unused (convention for React components and intentionally unused params).

## Codebase Layout

```
src/
  components/    — UI components (Navbar, Hero, MapSection, Footer, etc.)
  pages/         — Route-level components (HomePage, WorkDetail)
  hooks/         — Custom hooks (useWorks, useCities, useFilters, useFilteredWorks)
  services/      — API client (api.js)
  context/       — React context (MapLoadingContext)
  utils/         — Helpers (geo.js: haversine, image URL formatting, map adapters)
```
