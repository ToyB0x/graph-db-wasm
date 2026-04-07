---
name: blog
description: 技術ブログ記事（Zenn向け）の作成を支援するスキル。テーマや方向性をもとに対話的に記事の輪郭を固め、Playwright CLI でスクリーンショットや動画を撮影しながら、Zenn互換のMarkdown記事を生成する。「ブログを書く」「記事を作成」「blog」「write article」などのキーワードで起動。
allowed-tools: Bash(playwright-cli:*), Bash(npx playwright-cli:*), Bash(pnpm exec playwright-cli:*), Bash(mkdir:*), Bash(ls:*), Bash(date:*), Bash(ffmpeg:*), Bash(which:*), Bash(brew install ffmpeg:*), AskUserQuestion
---

# Blog — Zenn技術ブログ記事作成スキル

テーマや方向性をもとに、対話的に記事を構成し、必要な画像・動画を撮影しながら、Zenn互換のMarkdown記事ベースを生成する。

## 入力パラメータ

ユーザーの入力から以下を読み取る。明示されていない項目は Phase 1 の対話で確認する。

| パラメータ | 説明 | 例 |
|-----------|------|-----|
| **テーマ** | 記事の主題 | `kuzu-wasmでブラウザ内グラフDB` |
| **方向性** | 記事のトーンや切り口 | `入門者向けチュートリアル`, `技術深掘り` |
| **対象URL** | スクリーンショット撮影対象（任意） | `http://localhost:5173` |

ユーザーが「blog kuzu-wasmについて書きたい」のように短く指示した場合でも、すぐに Phase 1 を開始する。不足情報は対話の中で補う。

## ワークフロー

```
Phase 1. ディスカッション   テーマの深掘り・読者像・構成の方向性を対話で固める（2-3回）
Phase 2. アウトライン確定    記事構成と撮影計画をまとめ、ユーザーに確認
Phase 3. 素材撮影           Playwright CLI で必要なスクリーンショット・動画を撮影
Phase 4. 記事執筆           Zenn互換Markdownで記事ベースを生成
Phase 5. 完了               ファイルパスと概要を報告
```

---

### Phase 1: ディスカッション（2-3回の対話）

ユーザーと対話しながら、以下を明らかにする。一度に全部聞くのではなく、自然な会話の流れで2-3回に分けて確認する。

**第1回の対話で確認すること：**

- 記事のゴール（読者に何を持ち帰ってもらいたいか）
- 想定読者（初心者/中級者/上級者、どんな背景の人か）
- 記事の種類（チュートリアル/解説/体験記/比較記事など）

**第2回の対話で確認すること：**

- 記事に含めたい具体的なトピックやセクション
- コード例やデモが必要か
- スクリーンショット・動画で見せたい画面や操作フロー

**第3回の対話（必要に応じて）：**

- 記事タイトルの候補
- 特に強調したいポイントや差別化要素
- 参考にしたい記事や資料があるか

対話には `AskUserQuestion` ツールを使い、選択肢形式とフリーテキストを組み合わせる。

---

### Phase 2: アウトライン確定

ディスカッションの結果をもとに、以下をまとめてユーザーに提示する：

```
## 記事アウトライン

**タイトル案:** {タイトル}
**想定読者:** {読者像}
**Zenn Topics:** {トピック}

### 構成
1. はじめに — {概要}
2. {セクション2タイトル} — {概要}
3. ...

### 撮影計画
| # | タイミング | 種別 | 内容 |
|---|-----------|------|------|
| 1 | セクション2の後 | スクリーンショット | {何を撮るか} |
| 2 | セクション3の中 | 動画 | {操作フロー} |
| ... | | | |
```

ユーザーの承認を得てから次のフェーズに進む。修正要望があれば反映する。

---

### Phase 3: 素材撮影

対象URLが指定されている場合、Playwright CLI でスクリーンショット・動画を撮影する。

#### セットアップ

```bash
# 出力ディレクトリを作成（{NNN} は連番、例: 001, 002, ...）
# 既存の blog-output/ 内のディレクトリから次の番号を自動採番する
NEXT_NUM=$(printf "%03d" $(( $(ls -d blog-output/[0-9]* 2>/dev/null | wc -l | tr -d ' ') + 1 )))
mkdir -p blog-output/${NEXT_NUM}/images blog-output/${NEXT_NUM}/videos blog-output/${NEXT_NUM}/gifs

# ffmpeg の確認（GIF変換に必要）
which ffmpeg || echo "⚠️ ffmpeg が見つかりません。brew install ffmpeg でインストールしてください"

# ブラウザセッション開始
playwright-cli -s blog open {TARGET_URL}
sleep 2
playwright-cli -s blog snapshot
```

ffmpeg が見つからない場合は、ユーザーに `brew install ffmpeg` の実行を促す。GIF変換はできないが、記事作成自体は続行できる。

#### スクリーンショット撮影

```bash
# ページ全体
playwright-cli -s blog screenshot --filename blog-output/${NEXT_NUM}/images/{name}.png --full-page

# 特定要素のスクリーンショット
playwright-cli -s blog screenshot {element-ref} --filename blog-output/${NEXT_NUM}/images/{name}.png
```

#### 動画撮影とGIF自動変換

操作フローを記録し、撮影後に自動でGIFに変換する：

```bash
# 録画開始
playwright-cli -s blog video-start blog-output/${NEXT_NUM}/videos/{name}.webm

# 操作を人間のペースで実行（sleep を挟む）
playwright-cli -s blog click e42
sleep 1
playwright-cli -s blog fill e15 "example input"
sleep 1
playwright-cli -s blog click e20
sleep 2

# 録画停止
playwright-cli -s blog video-stop
```

**録画停止後、必ずGIFに変換する：**

```bash
# webm → GIF 変換（高品質・ファイルサイズ最適化）
ffmpeg -i blog-output/${NEXT_NUM}/videos/{name}.webm \
  -vf "fps=12,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
  -loop 0 \
  blog-output/${NEXT_NUM}/gifs/{name}.gif
```

**ffmpeg変換パラメータの説明：**
- `fps=12` — フレームレートを12fpsに削減（ファイルサイズ抑制）
- `scale=800:-1` — 横幅800pxに縮小（アスペクト比維持）
- `palettegen/paletteuse` — 高品質パレット生成でGIFの色品質を向上
- `-loop 0` — 無限ループ再生

必要に応じてパラメータを調整する：
- ファイルサイズが大きすぎる場合: `fps=8` や `scale=640:-1` に変更
- より高品質が必要な場合: `max_colors=256` や `fps=15` に変更

#### ページ遷移・スクロール

```bash
# ページ遷移
playwright-cli -s blog goto {URL}
sleep 2

# スクロール
playwright-cli -s blog mousewheel 0 300

# スナップショットで要素確認
playwright-cli -s blog snapshot
```

#### セッション終了

```bash
playwright-cli -s blog close
```

**撮影のガイドライン：**

- 撮影前にスナップショットで要素 ref を確認する
- 動画は人間が見てわかるペースで操作する（操作間に `sleep 1`）
- スクリーンショットはわかりやすいファイル名をつける（例: `01-initial-screen.png`）
- 撮影対象URLが無い場合はこのフェーズをスキップし、記事中に `<!-- TODO: スクリーンショットを追加 -->` プレースホルダーを入れる

---

### Phase 4: 記事執筆

#### ファイル名規則

```
blog-output/{NNN}/YYYY-MM-DD-{theme-slug}-base.md
```

例: `blog-output/002/2026-04-07-kuzu-wasm-browser-graphdb-base.md`

#### 記事フォーマット

Zennのfrontmatter付きMarkdownで記事を生成する。テンプレートは [templates/zenn-article-template.md](templates/zenn-article-template.md) を参照。

**執筆ルール：**

- **言語:** 日本語で書く（英語に自動翻訳されるため、翻訳しやすい自然な日本語を心がける）
- **文体:** 「です・ます」調。技術記事として正確かつ読みやすい文章
- **コードブロック:** 言語指定を必ずつける（```typescript, ```bash など）
- **画像参照:** 撮影した画像は相対パスで参照する（`![説明](./images/{name}.png)`）
- **GIF動画:** 変換済みのGIFを画像と同じ記法で埋め込む（`![説明](./gifs/{name}.gif)`）
- **セクション構成:**
  - `##` で大セクション
  - `###` でサブセクション
  - 長すぎるセクションは分割する
- **Zenn記法の活用:**
  - メッセージ: `:::message` / `:::message alert`
  - アコーディオン: `:::details タイトル`
  - 脚注: `テキスト[^1]` + `[^1]: 説明`
- **記事末尾に含めるもの:**
  - まとめセクション
  - 参考リンク（あれば）

---

### Phase 5: 完了

1. 生成されたファイル一覧を報告する：
   - 記事Markdownファイルのパス
   - 撮影した画像・GIF動画の一覧
2. 記事の概要（タイトル、セクション数、画像数、GIF数）を簡潔に伝える
3. 「ベース原稿なので、投稿前に確認・調整してください」と注記する

---

## ガイダンス

- **対話を大切にする。** 最初のディスカッションが記事の質を決める。テーマが曖昧でも、対話を通じて具体化していく。
- **読者目線で書く。** 想定読者が「これを読んでよかった」と思える内容を意識する。
- **画像は文章を補完する。** 文章で説明しにくい部分をビジュアルで補う。冗長な画像は避ける。
- **翻訳を意識した日本語。** 英語に自動翻訳されるため、主語を省略しすぎない。曖昧な指示代名詞を避ける。
- **ベース原稿であることを意識する。** 完璧を目指すよりも、構成がしっかりした調整しやすい原稿を目指す。
- **Playwright の操作は効率的に。** 複数の独立した操作は `&&` でまとめる。スナップショットで要素を確認してからクリック・入力する。

## テンプレート

| テンプレート | 用途 |
|------------|------|
| [templates/zenn-article-template.md](templates/zenn-article-template.md) | Zenn記事のfrontmatterテンプレート |
