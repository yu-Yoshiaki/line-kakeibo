import * as line from "@line/bot-sdk";
import { saveExpense, addIncomeRecord } from "../services/sheets";
import { client } from "../config/line";
import { handleIncomeMessage } from "../handlers/income-handler";
import { handleMenuMessage } from "../handlers/menu-handler";

interface ExpenseData {
  item: string;
  amount: number;
}

/**
 * LINEメッセージを処理する
 */
export async function handleMessage(event: line.WebhookEvent) {
  // First check if the event has replyToken
  if (!("replyToken" in event)) {
    console.log("Event does not have replyToken:", event.type);
    return;
  }

  if (event.type !== "message" || event.message.type !== "text") {
    return replyUnsupportedMessage(event.replyToken);
  }

  const { text } = event.message;

  // メニューの場合
  if (text === "メニュー" || text === "ヘルプ" || text === "help" || text === "menu") {
    const menuMessage = handleMenuMessage();
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [menuMessage]
    });
  }

  // 収入メッセージの場合
  if (text.startsWith("収入")) {
    try {
      const replyMessage = await handleIncomeMessage(event);
      return replyCustomMessage(event.replyToken, replyMessage);
    } catch (err) {
      console.error("Error handling income:", err);
      return replyError(event.replyToken);
    }
  }

  // 支出メッセージの場合
  const expenseData = parseExpenseMessage(text);
  if (!expenseData) {
    return replyInvalidFormat(event.replyToken);
  }

  try {
    await saveExpense(expenseData.item, expenseData.amount);
    return replySuccess(event.replyToken, expenseData);
  } catch (err) {
    console.error("Error saving expense:", err);
    return replyError(event.replyToken);
  }
}

/**
 * メッセージから支出データを抽出する
 */
function parseExpenseMessage(text: string): ExpenseData | null {
  const match = text.match(/^(.+?)\s+(\d+)円?$/);
  if (!match) return null;

  const [, item, amountStr] = match;
  const amount = parseInt(amountStr, 10);
  if (isNaN(amount)) return null;

  return { item, amount };
}

/**
 * 成功時の返信
 */
async function replySuccess(replyToken: string, data: ExpenseData) {
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: `記録しました！\n項目：${data.item}\n金額：${data.amount}円`,
      },
    ],
  });
}

/**
 * フォーマットエラー時の返信
 */
async function replyInvalidFormat(replyToken: string) {
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: "正しい形式で入力してください。\n例：ランチ 1000",
      },
    ],
  });
}

/**
 * 未対応メッセージの返信
 */
async function replyUnsupportedMessage(replyToken: string) {
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: "テキストメッセージのみ対応しています。\n例：ランチ 1000",
      },
    ],
  });
}

/**
 * エラー時の返信
 */
/**
 * カスタムメッセージの返信
 */
async function replyCustomMessage(replyToken: string, message: string) {
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  });
}

async function replyError(replyToken: string) {
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text: "エラーが発生しました。もう一度お試しください。",
      },
    ],
  });
}
