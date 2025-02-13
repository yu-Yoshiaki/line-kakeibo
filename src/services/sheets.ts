import { sheets, config } from '../config/sheets';

/**
 * スプレッドシートにデータを保存
 */
export async function saveExpense(item: string, amount: number): Promise<void> {
  const now = new Date();
  const values = [
    [
      now.toLocaleDateString('ja-JP'),
      now.toLocaleTimeString('ja-JP'),
      item,
      amount
    ]
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: config.defaultRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values
      }
    });
  } catch (err) {
    console.error('Failed to save to Google Sheets:', err);
    throw new Error('Failed to save expense data');
  }
}
