# 環境構築手順

## 1. LINE Developers設定

1. チャネルの作成
   - LINE Developersコンソールにログイン
   - 新規プロバイダーを作成（必要な場合）
   - Messaging APIチャネルを作成

2. Messaging API設定
   - チャネルの基本設定を行う
   - Webhook URLを設定
   - 応答設定を構成

3. アクセストークン
   - チャネルアクセストークンを発行
   - トークンを安全に保管

## 2. Google Cloud Platform設定

1. プロジェクト作成
   - GCPコンソールにログイン
   - 新規プロジェクトを作成
   - 請求先アカウントを設定（必要な場合）

2. API有効化
   - Google Sheets APIを有効化
   - 必要に応じて他のAPIも有効化

3. 認証設定
   - サービスアカウントを作成
   - 必要な権限を付与
   - 認証情報（JSONキー）をダウンロード

## 3. ローカル開発環境構築

1. 依存関係のインストール
   ```bash
   # プロジェクト初期化
   npm init -y
   
   # 依存関係のインストール
   npm install @hono/node-server hono @line/bot-sdk googleapis dotenv
   npm install -D typescript @types/node ts-node nodemon
   ```

2. 環境変数の設定
   ```bash
   # 環境変数テンプレートをコピー
   cp .env.example .env
   
   # .envファイルを編集し、以下の項目を設定
   # - LINE_CHANNEL_SECRET
   # - LINE_CHANNEL_ACCESS_TOKEN
   # - GOOGLE_SHEETS_PRIVATE_KEY
   # - GOOGLE_SHEETS_CLIENT_EMAIL
   # - SPREADSHEET_ID
   ```

3. TypeScript設定
   ```bash
   # TypeScript設定ファイルの作成
   npx tsc --init
   ```

## 4. 動作確認

1. ローカルサーバーの起動
   ```bash
   npm run dev
   ```

2. ngrokなどを使用してローカル環境を公開
   ```bash
   ngrok http 3000
   ```

3. Webhook URLの設定
   - ngrokで発行されたURLを LINE Developers コンソールに設定
   - Webhook URLの検証を実行

## 5. トラブルシューティング

1. LINE Webhook接続確認
   - Webhook URLの設定が正しいか確認
   - SSL証明書が有効か確認
   - ファイアウォール設定の確認

2. Google Sheets API接続確認
   - 認証情報が正しく設定されているか確認
   - APIが有効化されているか確認
   - スプレッドシートの権限設定確認
