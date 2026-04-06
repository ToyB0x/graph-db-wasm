# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser-based real-time graph database query preview app. Generates and queries ~100MB of network infrastructure graph data (datacenters, routers, machines, processes, etc.) entirely in the browser using kuzu-wasm (WebAssembly). Single-page React app deployed to GitHub Pages.

## Commands

- `pnpm install` — install dependencies (postinstall copies WASM worker + COI service worker to public/)
- `pnpm dev` — start Vite dev server at http://localhost:5173
- `pnpm build` — typecheck (`tsc -b`) then Vite build
- `pnpm typecheck` — TypeScript type checking only
- `pnpm preview` — serve the built dist/ locally

No test framework or linter is configured.

## Architecture

```
src/
├── App.tsx              — Main component, state management, orchestrates DB init + query execution
├── components/
│   ├── GraphView.tsx    — Cytoscape-based graph visualization
│   ├── QueryEditor.tsx  — Cypher query input
│   ├── ResultsView.tsx  — Tabular results display
│   ├── PresetQueries.tsx — Sample query dropdown
│   └── SeedProgress.tsx — Loading/seeding progress indicator
└── db/
    ├── index.ts         — Connection pool & query API (lazy init via init.ts)
    ├── init.ts          — DB initialization orchestration (load WASM → create schema → seed data)
    ├── schema.ts        — Cypher CREATE TABLE statements for all node/relationship types
    ├── seed.ts          — Batch CSV seeding using kuzu-wasm filesystem API
    ├── factories.ts     — Generator functions producing CSV batches for each entity type
    ├── queries.ts       — Preset Cypher queries
    ├── graphExtractor.ts — Converts query results to Cytoscape graph format
    └── kuzu-wasm.d.ts   — Type declarations for kuzu-wasm module
```

**Data flow**: App.tsx calls `db/index.ts` which lazily initializes via `init.ts` (schema → seed with progress callbacks) → user runs Cypher queries → results rendered as table + graph.

**Database seeding** uses generator-based CSV batch creation in `factories.ts`, written to kuzu-wasm's in-memory filesystem, then bulk-loaded via `COPY FROM` statements.

## Key Technical Details

- **kuzu-wasm** requires Cross-Origin-Opener-Policy headers — handled by `coi-serviceworker` in public/
- WASM worker file (`kuzu_wasm_worker.js`, ~15MB) is copied to public/ via postinstall script
- `kuzu-wasm` is excluded from Vite's dependency optimization (configured in vite.config.ts)
- Vite base path switches to `/graph-db-wasm/` when `GITHUB_PAGES=true` env var is set
- Uses `kuzu-wasm@0.11.3` (not the official `@lbug/lbug-wasm`) due to API incompatibility — see README for details
- TypeScript strict mode, ES2020 target, react-jsx transform
