import * as line from "@line/bot-sdk";
import { openai } from "../config/openai";
import { sheets, config as sheetsConfig } from "../config/sheets";
import { MessageData } from "./talkHistory";

// 検索クエリ生成リクエスト
interface QueryGenerationRequest {
  userMessage: string;
  recentMessages: MessageData[];
}

interface QueryGenerationResponse {
  searchQuery: string;
  confidence: number;
}

interface ConversationSearchRequest {
  searchQuery: string;
  conversations: MessageData[];
  maxResults: number;
}

interface ConversationSearchResponse {
  relevantConversations: {
    messages: MessageData[];
    relevanceScore: number;
    summary: string;
  }[];
  overallSummary: string;
}

interface ResponseGenerationRequest {
  searchResults: ConversationSearchResponse;
  originalQuery: string;
}

interface ResponseGenerationResponse {
  message: string;
  shouldIncludeDetails: boolean;
}

export class ConversationSearchService {
  /**
   * メッセージから検索意図を検出する
   */
  async detectSearchIntent(text: string): Promise<boolean> {
    // トリガーワードのリスト
    const triggerWords = [
      "あのはなし",
      "思い出して",
      "検索して",
      "前に話してた",
      "教えて",
      "なんだっけ",
    ];

    // 日本語の場合は大文字小文字を区別しない
    const normalizedText = text.toLowerCase();

    // いずれかのトリガーワードが含まれているか確認
    return triggerWords.some((word) => normalizedText.includes(word));
  }

  /**
   * OpenAI APIを使用して検索クエリを生成する
   */
  async generateSearchQuery(
    request: QueryGenerationRequest
  ): Promise<QueryGenerationResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "あなたはLINEグループの会話履歴を検索するためのクエリ生成アシスタントです。ユーザーの曖昧な質問から、過去の会話を検索するための最適なクエリを生成してください。JSONフォーマットで応答してください。",
          },
          {
            role: "user",
            content: `ユーザーメッセージ: "${
              request.userMessage
            }"\n\n最近の会話: ${JSON.stringify(
              request.recentMessages,
              null,
              2
            )}\n\n以下のJSONフォーマットで応答してください: {"searchQuery": "検索クエリ", "confidence": 0.8}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("OpenAI APIからの応答が空です");
      }

      // JSONパース
      const result = JSON.parse(content);

      return {
        searchQuery: result.searchQuery,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error("検索クエリ生成エラー:", error);
      // エラー時はデフォルトクエリを返す
      return {
        searchQuery: request.userMessage
          .replace(/あのはなしなんだっけ？|思い出して|検索して/g, "")
          .trim(),
        confidence: 0.5,
      };
    }
  }

  /**
   * 指定したグループの会話履歴を取得する
   */
  async fetchConversationHistory(
    groupId: string,
    limit: number = 100
  ): Promise<MessageData[]> {
    try {
      // スプレッドシートから会話履歴を取得
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetsConfig.spreadsheetId,
        range: `${groupId}!A2:H${limit + 1}`, // ヘッダー行を除いて取得
      });

      const rows = response.data.values || [];

      // 行データをMessageDataオブジェクトに変換
      return rows.map((row) => ({
        timestamp: row[0] || "",
        groupId: row[1] || "",
        groupName: row[2] || "",
        groupPictureUrl: row[3] || undefined,
        userId: row[4] || "",
        userName: row[5] || "",
        messageType: row[6] || "",
        content: row[7] || "",
      }));
    } catch (error) {
      console.error("会話履歴取得エラー:", error);
      return [];
    }
  }

  /**
   * OpenAI APIを使用して関連会話を検索する
   */
  async searchConversations(
    request: ConversationSearchRequest
  ): Promise<ConversationSearchResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "あなたはLINEグループの会話履歴から関連する会話を検索・要約するアシスタントです。検索クエリに基づいて最も関連性の高い会話を見つけ、要約してください。JSONフォーマットで応答してください。",
          },
          {
            role: "user",
            content: `検索クエリ: "${
              request.searchQuery
            }"\n\n会話履歴: ${JSON.stringify(
              request.conversations,
              null,
              2
            )}\n\n最大結果数: ${
              request.maxResults
            }\n\n以下のJSONフォーマットで応答してください: {"relevantConversations": [{"messages": [], "relevanceScore": 0.9, "summary": "要約文"}], "overallSummary": "全体的な要約"}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("OpenAI APIからの応答が空です");
      }

      // JSONパース
      return JSON.parse(content);
    } catch (error) {
      console.error("会話検索エラー:", error);
      // エラー時はデフォルトレスポンスを返す
      return {
        relevantConversations: [],
        overallSummary: "会話の検索中にエラーが発生しました。",
      };
    }
  }

  /**
   * 検索結果に基づいてレスポンスを生成する
   */
  async generateResponse(
    request: ResponseGenerationRequest
  ): Promise<ResponseGenerationResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content:
              "あなたはLINEグループの会話履歴検索結果を自然な形で返答するアシスタントです。検索結果を元に、ユーザーの質問に対する適切な返答を生成してください。詳細情報を含めるべき場合は、文章中に「詳細情報を含める」という指示を入れてください。",
          },
          {
            role: "user",
            content: `元の質問: "${
              request.originalQuery
            }"\n\n検索結果: ${JSON.stringify(request.searchResults, null, 2)}`,
          },
        ],
        temperature: 0.8,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("OpenAI APIからの応答が空です");
      }

      // 詳細情報を含めるかどうかを判定
      const shouldIncludeDetails =
        content.includes("詳細情報を含める") ||
        request.searchResults.relevantConversations.length <= 2;

      return {
        message: content.replace(/詳細情報を含める/g, "").trim(),
        shouldIncludeDetails,
      };
    } catch (error) {
      console.error("レスポンス生成エラー:", error);
      // エラー時はデフォルトメッセージを返す
      return {
        message:
          "申し訳ありません、会話の検索結果をまとめることができませんでした。",
        shouldIncludeDetails: false,
      };
    }
  }

  /**
   * LINE用のメッセージフォーマットに変換する
   */
  formatResponseMessage(
    response: ResponseGenerationResponse,
    searchResults: ConversationSearchResponse
  ): any[] {
    const messages: any[] = [];

    // メインメッセージ
    messages.push({
      type: "text",
      text: response.message,
    });

    // 詳細情報を含める場合
    if (
      response.shouldIncludeDetails &&
      searchResults.relevantConversations.length > 0
    ) {
      const detailsText = searchResults.relevantConversations
        .map((conv, index) => {
          return `【会話 ${index + 1}】\n${conv.summary}`;
        })
        .join("\n\n");

      if (detailsText.length > 0) {
        messages.push({
          type: "text",
          text: `【詳細情報】\n${detailsText}`,
        });
      }
    }

    return messages;
  }
}

export const conversationSearchService = new ConversationSearchService();
