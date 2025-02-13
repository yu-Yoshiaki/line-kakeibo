# LINE家計簿

LINEとGoogle Spreadsheetを連携した家計簿管理アプリケーション

## 機能

- LINEを通じた家計簿データの入力
- Google Spreadsheetsへの自動記録
- 月次支出レポートの自動生成と送信

## 技術スタック

- Backend: Hono.js + TypeScript
- LINE Messaging API
- Google Sheets API

## セットアップ

1. 必要な依存関係をインストール:
```bash
npm install
```

2. 環境変数の設定:
```bash
cp .env.example .env
```
`.env`ファイルを編集し、必要な環境変数を設定してください。

3. 開発サーバーの起動:
```bash
npm run dev
```

## 開発

- `npm run dev`: 開発サーバーの起動
- `npm run build`: プロダクションビルド
- `npm start`: プロダクションサーバーの起動

## プロジェクト構造

```
src/
  ├── index.ts          # メインアプリケーション
  ├── config.ts         # 設定管理
  ├── middleware/       # ミドルウェア
  ├── routes/          # ルーター
  ├── line/           # LINEボット関連
  └── sheets/         # Google Sheets関連
```

## ライセンス

ISC
