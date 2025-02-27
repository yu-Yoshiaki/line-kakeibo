import * as line from "@line/bot-sdk";
import { client } from "../config/line";
import { conversationSearchService } from "../services/conversationSearch";
import { MessageData } from "../services/talkHistory";

/**
 * 検索クエリかどうかを判定する
 */
export async function isSearchQuery(text: string): Promise<boolean> {
  return conversationSearchService.detectSearchIntent(text);
}

/**
 * 会話検索を処理する
 */
export async function handleConversationSearch(event: line.MessageEvent): Promise<any> {
  try {
    // まず「検索中...」というメッセージを送信
    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "検索中です... 少々お待ちください 🔍"
        }
      ]
    });

    // ユーザーのメッセージを取得
    const userMessage = event.message.type === 'text' ? event.message.text : '';
    
    // 会話検索処理を実行
    const searchQuery = await conversationSearchService.generateSearchQuery({
      userMessage,
      recentMessages: [] // 必要に応じて最近のメッセージを取得
    });
    
    // 会話履歴を取得
    let conversations: MessageData[] = [];
    if (event.source.type === 'group') {
      conversations = await conversationSearchService.fetchConversationHistory(event.source.groupId);
    }
    
    // 会話を検索
    const searchResults = await conversationSearchService.searchConversations({
      searchQuery: searchQuery.searchQuery,
      conversations,
      maxResults: 3
    });
    
    // レスポンスを生成
    const response = await conversationSearchService.generateResponse({
      originalQuery: userMessage,
      searchResults
    });
    
    // メッセージをフォーマット
    const messages = conversationSearchService.formatResponseMessage(response, searchResults);
    
    // 検索結果を別のメッセージとして送信（push message）
    if (event.source.type === 'user') {
      await client.pushMessage({
        to: event.source.userId,
        messages
      });
    } else if (event.source.type === 'group') {
      await client.pushMessage({
        to: event.source.groupId,
        messages
      });
    }
    
    return null; // すでにreplyMessageを使用したので、nullを返す
  } catch (error) {
    console.error('会話検索エラー:', error);
    
    // エラーが発生した場合は、エラーメッセージをpushする
    try {
      if (event.source.type === 'user') {
        await client.pushMessage({
          to: event.source.userId,
          messages: [{
            type: "text",
            text: "申し訳ありません、検索中にエラーが発生しました。しばらくしてからもう一度お試しください。"
          }]
        });
      } else if (event.source.type === 'group') {
        await client.pushMessage({
          to: event.source.groupId,
          messages: [{
            type: "text",
            text: "申し訳ありません、検索中にエラーが発生しました。しばらくしてからもう一度お試しください。"
          }]
        });
      }
    } catch (pushError) {
      console.error('エラーメッセージ送信失敗:', pushError);
    }
    
    return null;
  }
}

export const conversationSearchHandler = {
  isSearchQuery,
  handleConversationSearch
};
