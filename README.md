# GraphDB WASM Preview

A browser-based real-time graph database query preview app powered by LadybugDB (WASM).

Generates and queries ~100MB of network infrastructure graph data entirely in the browser.

Reference: [network-management](https://github.com/ToyB0x/network-management)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- kuzu-wasm (in-memory graph database via WebAssembly)

## Getting Started

```bash
pnpm install
pnpm dev
```

1. Open http://localhost:5173 in your browser
2. DB initialization and seeding starts automatically
3. After completion, enter and execute Cypher queries

## Data Model

Network infrastructure graph:

- **DataCenter** → Router, Rack
- **Router** → Network
- **Rack** → Switch, Machine
- **Machine** → Interface, Process
- **Interface** → Network, Port
- **Process** → SoftwareVersion, Port
- **Software** → SoftwareVersion

~43,000 machines and ~108,000 processes in ~100MB of graph data.

## Note: kuzu-wasm dependency

This project uses [`kuzu-wasm@0.11.3`](https://www.npmjs.com/package/kuzu-wasm) as its graph database engine. While [LadybugDB](https://ladybugdb.com/) is the intended target, the official npm package [`@lbug/lbug-wasm@0.13.1`](https://www.npmjs.com/package/@lbug/lbug-wasm) currently ships with a different API that is incompatible with this project's architecture:

| Feature | kuzu-wasm (used) | @lbug/lbug-wasm |
|---|---|---|
| API style | Worker-based async API | Single-bundle Emscripten |
| Query | `conn.query()` → `QueryResult` | `conn.execute()` → Apache Arrow Table |
| Results | `getAllObjects()`, `getColumnNames()` | `table.toString()` (JSON) |
| Filesystem | `kuzu.FS` (writeFile, mkdir, unlink) | Internal Emscripten FS (no public API) |
| Worker | Separate file (`setWorkerPath`) | None (single-threaded) |

The async worker-based API documented at [docs.ladybugdb.com](https://docs.ladybugdb.com/client-apis/wasm/) is not included in the current npm package.
[LadybugDB/ladybug-wasm#7](https://github.com/LadybugDB/ladybug-wasm/pull/7) has been merged but not yet published. Once a compatible version is published, migration to `@lbug/lbug-wasm` should be straightforward as the async API is identical.
