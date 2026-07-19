# PackTrans Glossary Web

Static React web App for [`@packtrans/glossary`](https://github.com/packtrans/glossary), powered by [Vite+](https://viteplus.dev/).

## Prerequisites

- [`vp` CLI](https://viteplus.dev/) (install: `curl -fsSL https://vite.plus | bash`)
- GitHub Packages read access for `@packtrans/glossary` (see [Authentication](#authentication))

Vite+ manages the Node.js runtime and pnpm version for this project.

## Authentication

The WASM bindings are published to GitHub Packages as `@packtrans/glossary`. Create a GitHub personal access token with `read:packages` and authenticate before installing:

```sh
export GITHUB_NPM_AUTH_TOKEN=ghp_...
pnpm config set //npm.pkg.github.com/:_authToken "$GITHUB_NPM_AUTH_TOKEN"
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

## TODO

- [ ] Fuzzy match

## Tooling notes

- Lint/format config lives in `vite.config.ts` (`lint`, `fmt` blocks)
- `vp check` replaces separate `eslint` + `tsc` runs for local validation
- `vp test` is available when you add `*.test.ts(x)` files; there are none in this demo yet

## Related repositories

- [packtrans/glossary](https://github.com/packtrans/glossary) — Rust CLI and WASM bindings (`@packtrans/glossary` npm package)
- [packtrans/glossary-indexes](https://github.com/packtrans/glossary-indexes) — release-managed glossary indexes

## Acknowledgement

This project use [Dinkie Icons](https://github.com/atelier-anchor/dinkie-icons) for its favicon.
