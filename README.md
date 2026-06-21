# PackTrans Glossary Web

Static React demo for [`@packtrans/glossary`](https://github.com/packtrans/glossary/pkgs/npm/glossary), powered by [Vite+](https://viteplus.dev/).

## Prerequisites

- [`vp` CLI](https://viteplus.dev/) (install: `curl -fsSL https://vite.plus | bash`)
- GitHub Packages read access for `@packtrans/glossary` (see [Authentication](#authentication))

Vite+ manages the Node.js runtime and pnpm version for this project.

## Authentication

The WASM bindings are published to GitHub Packages as `@packtrans/glossary`. Create a GitHub personal access token with `read:packages` and authenticate before installing:

```sh
export NODE_AUTH_TOKEN=ghp_...
vp install
```

## Commands

```sh
vp install   # install dependencies (pnpm)
vp dev       # dev server
vp check     # format + lint + type-check
vp build     # production build
vp preview   # preview via Workers runtime (Cloudflare Vite plugin)
vp run deploy  # build and wrangler deploy
```

## Demo scope

- Hardcoded `zh_cn` language
- Source-to-target search only (inverse CJK queries are not supported in WASM)
- Pure static site: the glossary index zip is fetched cross-origin from PackTrans CDN (CORS-enabled) and loaded into WASM memory in the browser

CDN index URL (`src/types/glossary.ts`):

`https://cdn.packtrans.download/glossary/packtrans-glossary-index-zh_cn-20260601.zip`

Local dev uses `http://localhost:5173` (Vite `server.host`) so the browser origin matches CDN CORS. `127.0.0.1:5173` is a different origin and will be blocked unless you add it on the CDN too.

## Tooling notes

- Lint/format config lives in `vite.config.ts` (`lint`, `fmt` blocks) — ESLint was removed during Vite+ migration
- `vp check` replaces separate `eslint` + `tsc` runs for local validation
- `vp test` is available when you add `*.test.ts(x)` files; there are none in this demo yet

## Deploy to Cloudflare Workers

The app is a static SPA deployed with the [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/). Input configuration is in `wrangler.toml`; `vp build` emits client assets and an output `wrangler.json` under `dist/` for preview and deploy.

After `wrangler login`:

```sh
vp run deploy
```

Or connect this repository in the [Cloudflare dashboard](https://dash.cloudflare.com/) and let Cloudflare build and deploy on push. Set `NODE_AUTH_TOKEN` as a build environment variable so install can fetch `@packtrans/glossary` from GitHub Packages.

Requirements: Wrangler **4.102.0+** (included as a dev dependency).

### Local Workers preview

Preview the production build in the Workers runtime (matches deployed behavior):

```sh
vp build
vp preview
```

## Related repositories

- [packtrans/glossary](https://github.com/packtrans/glossary) — Rust CLI and WASM bindings (`@packtrans/glossary` npm package)
- [packtrans/glossary-indexes](https://github.com/packtrans/glossary-indexes) — release-managed glossary indexes
