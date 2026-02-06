# `frontend/` 向け AGENTS 指示

## 適用範囲
- このファイルは `frontend/` 配下のすべてに適用する。

## 技術スタック
- React 19 + TypeScript + Vite 7
- Tailwind CSS v4（`@tailwindcss/vite` 経由）

## 作業ルール
- ソースコードは `frontend/src/` に置き、TypeScript（`.ts` / `.tsx`）を使う。
- React は関数コンポーネントを優先し、既存の ESLint 設定に従う。
- `node_modules/` は編集しない。`package-lock.json` は依存変更時のみ更新する。
- グローバルスタイルは `src/index.css` に集約し、コンポーネントの見た目は Tailwind ユーティリティクラスを優先する。

## 検証コマンド
- 開発サーバー: `cd frontend && npm run dev`
- Lint: `cd frontend && npm run lint`
- 本番ビルド: `cd frontend && npm run build`

## 連携メモ
- Vite 経由で backend API を呼ぶ場合、プロキシ先は Laravel の URL（`http://localhost`）に合わせる。
