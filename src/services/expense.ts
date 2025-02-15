import { sheets, config } from "../config/sheets";

export interface ExpenseData {
  transactionId: string;
  date: Date;
  category: string;
  amount: number;
  paymentMethod: string;
  receiptUrl?: string;
  memo: string;
}

/**
 * 経費データをスプレッドシートに追加
 */
export async function saveExpenseRecord(data: ExpenseData): Promise<void> {
  const values = [
    [
      data.transactionId,
      formatDate(data.date),
      data.category,
      data.amount,
      data.paymentMethod,
      data.receiptUrl || "",
      data.memo,
    ],
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: "経費!A3:G", // schema.yamlに基づいたシート名と列範囲
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  } catch (err) {
    console.error("Failed to save expense data to Google Sheets:", err);
    throw new Error("経費データの保存に失敗しました");
  }
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
