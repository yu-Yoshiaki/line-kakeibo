import * as line from "@line/bot-sdk";
import { saveExpense, addIncomeRecord } from "../services/sheets";
import { client } from "../config/line";
import { handleIncomeMessage } from "../handlers/income-handler";
import { handleMenuMessage } from "../handlers/menu-handler";
import { handleExpenseMessage } from "../handlers/expense-handler";
import { GroupMemberHandler } from "../handlers/group-member-handler";

interface ExpenseData {
  item: string;
  amount: number;
}

const menu = [
  { key: "help", label: "ヘルプ" },
  { key: "menu", label: "メニュー" },
  { key: "members", label: "メンバー一覧" },
];

const groupMemberHandler = new GroupMemberHandler();

/**
 * LINEメッセージを処理する
 */
export async function handleMessage(event: line.WebhookEvent) {
  // First check if the event has replyToken
  if (!("replyToken" in event)) {
    console.log("Event does not have replyToken:", event.type);
    return;
  }

  // mention確認
  if (event.type === "follow") {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "ようこそ!",
        },
      ],
    });
  }

  if (event.type !== "message" || event.message.type !== "text") {
    return replyUnsupportedMessage(event.replyToken);
  }

  const { text } = event.message;

  // メンバー登録コマンドの処理
  if (text.startsWith("メンバー登録")) {
    const result = await groupMemberHandler.handleMemberRegistration(event);
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: result.message }],
    });
  }

  // メンバー一覧の取得
  if (text === "members" && event.source.type === "group") {
    const groupId = event.source.groupId;
    const result = await groupMemberHandler.getGroupMembers(groupId);
    let responseText = result.message;
    if (result.members) {
      responseText +=
        "\n" +
        result.members
          .map(
            (m) =>
              `・${m.name} (登録日: ${new Date(
                m.joinedAt
              ).toLocaleDateString()})`
          )
          .join("\n");
    }
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: "text", text: responseText }],
    });
  }

  // メニューの場合
  if (menu.some((item) => item.key === text)) {
    const menuMessage = handleMenuMessage();
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [menuMessage],
    });
  }
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
