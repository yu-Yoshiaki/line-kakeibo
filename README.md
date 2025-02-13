# LINE家計簿

LINEとGoogle Spreadsheetを連携した家計簿管理アプリケーション

## 機能

- LINEを通じた家計簿データの入力
  - フォーマット: `[項目] [金額]`
  - 例: `ランチ 1000`
- Google Spreadsheetsへの自動記録
  - 日付、時間、項目、金額を記録

## 技術スタック

- Backend: Hono.js + TypeScript
- LINE Messaging API (@line/bot-sdk)
- Google Sheets API (googleapis)

## セットアップ

1. 必要な依存関係をインストール:
```bash
npm install
```

2. 環境変数の設定:
```bash
cp .env.example .env
```

以下の環境変数を設定してください：

```env
# LINE Bot設定
LINE_CHANNEL_SECRET=your_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token

# Google Sheets API設定
GOOGLE_SHEETS_PRIVATE_KEY=your_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_client_email
SPREADSHEET_ID=your_spreadsheet_id

# サーバー設定
PORT=3000
```

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
  ├── config/          # 設定管理
  │   ├── line.ts    # LINE Bot設定
  │   └── sheets.ts  # Google Sheets設定
  ├── handlers/        # イベントハンドラー
  │   ├── webhook-handler.ts
  │   └── line-message.ts
  ├── routes/          # ルーティング
  │   └── webhook.ts
  └── services/        # 外部サービス連携
      └── sheets.ts
```

## ドキュメント

- [LINE Botメッセージハンドラー実装仕様書](docs/features/line-bot-message-handler.md)
- [開発ワークフロー](docs/workflow.md)
- [プロジェクト構造](docs/dev-structure.yaml)

## ライセンス

ISC
