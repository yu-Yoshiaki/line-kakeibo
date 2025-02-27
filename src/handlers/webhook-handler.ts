import { Context } from "hono";
import * as line from "@line/bot-sdk";
import { handleMessage } from "./line-message";
import { config } from "../config/line";
import { handleTalkHistory } from "./talkHistory";
import { conversationSearchHandler } from "./conversationSearch";

/**
 * Webhookリクエストを処理する
 */
export async function webhookHandler(c: Context) {
  const signature = c.req.header("x-line-signature");
  const rawBody = await c.req.text();

  // 署名検証
  if (
    !signature ||
    !line.validateSignature(rawBody, config.channelSecret, signature)
  ) {
    return c.text("Invalid signature", 403);
  }

  try {
    console.log("🔥", rawBody);
    const body = JSON.parse(rawBody);

    const events: line.WebhookEvent[] = body.events;

    // 全てのイベントを処理
    const results = await Promise.all(events.map(async (event) => {
      try {
        // トーク履歴の保存
        await handleTalkHistory(event);
        
        // 会話検索クエリかどうかを判定
        if (event.type === 'message' && event.message.type === 'text') {
          const isSearchQuery = await conversationSearchHandler.isSearchQuery(event.message.text);
          if (isSearchQuery) {
            await conversationSearchHandler.handleConversationSearch(event);
            return null; // handleConversationSearchが応答を処理するので、nullを返す
          }
        }
        
        // 通常のメッセージ処理
        return await handleMessage(event);
      } catch (error) {
        console.error("Event processing error:", error);
        return null;
      }
    }));

    return c.json(results.filter(result => result !== null));
  } catch (err) {
    console.error("Webhook error:", err);
    return c.text("Internal Server Error", 500);
  }
}
