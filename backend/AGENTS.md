# `backend/` 向け AGENTS 指示

## 適用範囲
- このファイルは `backend/` 配下のすべてに適用する。

## プロジェクト構成
- Laravel アプリ本体は `backend/src/` にある。
- コンテナ定義は `backend/docker-compose.yml` と `backend/infra/` にある。

## 作業ルール
- Laravel の実装変更は `backend/src/` を起点にし、変更対象は原則 `app/`、`routes/`、`config/`、`database/`、`resources/`、`tests/` とする。
- 生成物や依存物は直接編集しない（`vendor/`、`storage/` の実行時生成物、`bootstrap/cache/`）。
- `.env` の秘密情報はコミットしない。環境変数を追加する場合は `.env.example` も更新する。

## 検証コマンド
- PHP テスト: `cd backend/src && php artisan test`
- PHP フォーマット（必要時）: `cd backend/src && ./vendor/bin/pint`
- Laravel Vite 用フロントビルド: `cd backend/src && npm run build`

## Docker 利用
- `backend/` で起動: `docker compose up -d`
- アプリ URL は nginx 経由で `http://localhost`（`80` 番ポート）。
