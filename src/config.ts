import dotenv from 'dotenv';

dotenv.config();

export const config = {
  line: {
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  },
  google: {
    sheets: {
      privateKey: process.env.GOOGLE_SHEETS_PRIVATE_KEY || '',
      clientEmail: process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '',
      spreadsheetId: process.env.SPREADSHEET_ID || '',
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  },
};
