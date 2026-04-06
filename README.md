# GraphDB WASM Preview

LadybugDB (WASM) を使ったブラウザ内リアルタイムグラフDBクエリプレビューアプリ。

ネットワーク管理のグラフデータ (~100MB) をブラウザ内で生成・クエリできます。

参考: [network-management](https://github.com/ToyB0x/network-management)

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- LadybugDB WASM (in-memory graph database)

## Getting Started

```bash
pnpm install
pnpm dev
```

1. ブラウザで http://localhost:5173 を開く
2. 自動でDB初期化・シーディングが開始される
3. 完了後、Cypherクエリを入力して実行

## Data Model

ネットワークインフラのグラフ:

- **DataCenter** → Router, Rack
- **Router** → Network
- **Rack** → Switch, Machine
- **Machine** → Interface, Process
- **Interface** → Network, Port
- **Process** → SoftwareVersion, Port
- **Software** → SoftwareVersion

約43,000台のマシン、108,000のプロセスを含む ~100MB のグラフデータ。

## Note: kuzu-wasm alias

`package.json` で `"lbug-wasm": "npm:kuzu-wasm@0.11.3"` としてkuzu-wasmをlbug-wasmのエイリアスで使用しています。

本来は公式パッケージ [`@lbug/lbug-wasm`](https://www.npmjs.com/package/@lbug/lbug-wasm) を使用すべきですが、以下の理由によりワークアラウンドとしてkuzu-wasmを利用しています:

1. **APIの非互換性**: `@lbug/lbug-wasm@0.13.1` は kuzu-wasm とは異なるAPIを提供している
   - kuzu-wasm: Worker分離型の非同期API (`setWorkerPath`, `Database.init()`, `Connection.query()` → `QueryResult` with `getAllObjects()`, `getColumnNames()`, `isSuccess()` 等)
   - @lbug/lbug-wasm: 単一バンドル型API (`lbug_wasm()` factory → `conn.execute()` → Apache Arrow Table)
2. **Worker/FSの欠如**: `@lbug/lbug-wasm` のnpmパッケージにはWorkerファイルが含まれておらず、CSV COPY FROMによるバルクシーディングに必要な `FS` オブジェクトの公開APIも異なる
3. **上流の修正待ち**: [LadybugDB/ladybug-wasm#7](https://github.com/LadybugDB/ladybug-wasm/pull/7) がマージ済みだが、kuzu-wasm互換の非同期APIを含む新バージョンがnpmにパブリッシュされていない

上流パッケージが更新され次第、正式な `@lbug/lbug-wasm` への移行を検討します。
