import { WebhookEvent, MessageEvent, JoinEvent } from '@line/bot-sdk';
import { talkHistoryService } from '../services/talkHistory';
import { client } from '../config/line';

const JOIN_MESSAGE = {
  type: 'textV2',
  text: 'こんにちは！グループのトーク履歴を取得できるように、過去のトーク履歴を.txt形式でこのグループにアップロードしてください。'
} as const;

export async function handleTalkHistory(event: WebhookEvent): Promise<void> {
  try {
    switch (event.type) {
      case 'message':
        await handleMessageEvent(event as MessageEvent);
        break;
      case 'join':
        await handleJoinEvent(event as JoinEvent);
        break;
    }
  } catch (error) {
    console.error('Error handling talk history:', error);
    throw error;
  }
}

async function handleMessageEvent(event: MessageEvent): Promise<void> {
  try {
    // メッセージを保存
    await talkHistoryService.saveMessage(event);
  } catch (error) {
    console.error('Error handling message event:', error);
    throw error;
  }
}

async function handleJoinEvent(event: JoinEvent): Promise<void> {
  try {
    // グループ参加時の処理
    await talkHistoryService.handleJoinEvent(event);
    
    // 初回参加メッセージを送信
    if (event.source.type === 'group') {
      await client.pushMessage({
        to: event.source.groupId,
        messages: [JOIN_MESSAGE]
      });
    }
  } catch (error) {
    console.error('Error handling join event:', error);
    throw error;
  }
}
