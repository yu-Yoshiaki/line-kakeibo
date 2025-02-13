import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// 環境変数の確認
console.log('Checking Google Sheets credentials:');
console.log('CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL);
console.log('PRIVATE_KEY exists:', !!process.env.GOOGLE_SHEETS_PRIVATE_KEY);
console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID);

// 秘密鍵の処理
const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY
  ? process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

// Google Sheets APIクライアントの初期化
const auth = new JWT({
  email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

console.log('JWT auth configured with email:', auth.email);

// Google Sheets APIクライアント
export const sheets = google.sheets({ version: 'v4', auth });

// スプレッドシートの設定
export const config = {
  spreadsheetId: process.env.SPREADSHEET_ID!,
  defaultRange: '家計簿!A:D' // 日本語のシート名を使用
};
