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
2. "Initialize & Seed Database" ボタンをクリック
3. シーディング完了後、Cypherクエリを入力して実行

## Data Model

ネットワークインフラのグラフ:

- **DataCenter** → Router, Rack
- **Router** → NetworkZone → Rack
- **Rack** → Switch, Machine
- **Machine** → Process → Software
- **Process** → Port (LISTENS)

約48,000台のマシン、120,000以上のプロセスを含む ~100MB のグラフデータ。
