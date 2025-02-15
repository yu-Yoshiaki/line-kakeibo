import { sheets_v4 } from "googleapis";
import { sheets, config } from "../config/sheets";

export interface IncomeData {
  transactionId: string;
  date: Date;
  category: string;
  amount: number;
  client: string;
  memo: string;
}

/**
 * 日付を「YYYY-MM-DD」形式にフォーマット
 */
function formatDate(date: Date): string {
  return date
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/")
    .join("-");
}

/**
 * 時刻を「HH:MM:SS」形式にフォーマット
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 収入データをスプレッドシートに追加
 */
export async function addIncomeRecord(data: IncomeData): Promise<void> {
  const values = [
    [
      data.transactionId,
      formatDate(data.date),
      data.category,
      data.amount,
      data.client,
      data.memo,
    ],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: "収入!A3:F", // schema.yamlに基づいたシート名と列範囲
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  } catch (err) {
    console.error("Failed to save income data to Google Sheets:", err);
    throw new Error("収入データの保存に失敗しました");
  }
}

/**
 * 支出データをスプレッドシートに违加
 */
export async function saveExpense(item: string, amount: number): Promise<void> {
  const now = new Date();
  const values = [[formatDate(now), formatTime(now), item, amount]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: config.defaultRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  } catch (err) {
    console.error("Failed to save expense data to Google Sheets:", err);
    throw new Error("支出データの保存に失敗しました");
  }
}
