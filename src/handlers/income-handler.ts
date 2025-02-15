import { WebhookEvent } from '@line/bot-sdk';
import { IncomeData, addIncomeRecord } from '../services/sheets';
import { generateTransactionId } from '../utils/id-generator';

const VALID_CATEGORIES = ['事業収入', '給与', '副収入', 'その他収入'];

/**
 * 収入メッセージを処理する
 * フォーマット: 収入 [金額] [収入種別] [取引先] [メモ]
 */
export async function handleIncomeMessage(event: WebhookEvent): Promise<string> {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return '申し訳ありません。テキストメッセージのみ対応しています。';
  }

  const text = event.message.text.trim();
  
  // 収入メッセージのパース
  try {
    const incomeData = parseIncomeMessage(text);
    if (!incomeData) {
      return getFormatErrorMessage();
    }

    // Google Sheetsに登録
    await addIncomeRecord(incomeData);

    return getSuccessMessage(incomeData);
  } catch (error) {
    console.error('Income registration error:', error);
    return '申し訳ありません。収入の登録中にエラーが発生しました。';
  }
}

/**
 * 収入メッセージをパースしてデータを抽出する
 */
function parseIncomeMessage(text: string): IncomeData | null {
  // "収入"で始まるメッセージのみ処理
  if (!text.startsWith('収入')) {
    return null;
  }

  // メッセージを分割
  const parts = text.split(' ').filter(part => part.trim() !== '');
  if (parts.length < 4) {
    return null;
  }

  // 金額の処理
  const amount = Number(parts[1]);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('金額は正の数値で入力してください');
  }

  // カテゴリーの検証
  const category = parts[2];
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`無効な収入種別です。有効な種別: ${VALID_CATEGORIES.join(', ')}`);
  }

  // 取引先
  const client = parts[3];

  // メモ（残りの部分を結合）
  const memo = parts.slice(4).join(' ');

  return {
    transactionId: generateTransactionId(),
    date: new Date(),
    category,
    amount,
    client,
    memo
  };
}

/**
 * フォーマットエラー時のメッセージを生成
 */
function getFormatErrorMessage(): string {
  return [
    '収入の登録には以下のフォーマットを使用してください：',
    '収入 [金額] [収入種別] [取引先] [メモ]',
    '',
    '例：収入 250000 給与 株式会社ABC 1月分給与',
    '',
    `有効な収入種別：${VALID_CATEGORIES.join(', ')}`
  ].join('\n');
}

/**
 * 登録成功時のメッセージを生成
 */
function getSuccessMessage(data: IncomeData): string {
  const formattedAmount = new Intl.NumberFormat('ja-JP').format(data.amount);
  return [
    '✅ 収入を登録しました',
    `金額：${formattedAmount}円`,
    `種別：${data.category}`,
    `取引先：${data.client}`,
    `メモ：${data.memo}`,
    `取引ID：${data.transactionId}`
  ].join('\n');
}
