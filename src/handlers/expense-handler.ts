import { TextMessage } from '@line/bot-sdk';
import { saveExpenseRecord, ExpenseData } from '../services/expense';

const EXPENSE_CATEGORIES = ['交通費', '通信費', '交際費', '消耗品費', 'その他経費'];
const PAYMENT_METHODS = ['現金', 'クレジットカード', '銀行振込'];

export async function handleExpenseMessage(message: string): Promise<TextMessage> {
  try {
    const parsedData = parseExpenseMessage(message);
    validateExpenseData(parsedData);
    
    const transactionId = generateTransactionId();
    const expenseData: ExpenseData = {
      ...parsedData,
      transactionId,
      date: new Date(),
      receiptUrl: undefined
    };
    
    await saveExpenseRecord(expenseData);
    
    return {
      type: 'text',
      text: formatSuccessMessage(expenseData)
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        type: 'text',
        text: error.message
      };
    }
    return {
      type: 'text',
      text: '経費の登録中にエラーが発生しました。'
    };
  }
}

interface ParsedExpenseData {
  amount: number;
  category: string;
  paymentMethod: string;
  memo: string;
}

function parseExpenseMessage(message: string): ParsedExpenseData {
  const parts = message.split(' ');
  
  if (parts.length < 5) {
    throw new Error(
      '経費の登録には以下のフォーマットを使用してください：\n' +
      '経費 [金額] [経費種別] [支払方法] [メモ]'
    );
  }

  return {
    amount: parseInt(parts[1], 10),
    category: parts[2],
    paymentMethod: parts[3],
    memo: parts.slice(4).join(' ')
  };
}

function validateExpenseData(data: ParsedExpenseData): void {
  if (isNaN(data.amount) || data.amount <= 0) {
    throw new Error('金額は正の数値で入力してください');
  }

  if (!EXPENSE_CATEGORIES.includes(data.category)) {
    throw new Error(
      '無効な経費種別です。有効な種別: ' +
      EXPENSE_CATEGORIES.join(', ')
    );
  }

  if (!PAYMENT_METHODS.includes(data.paymentMethod)) {
    throw new Error(
      '無効な支払方法です。有効な方法: ' +
      PAYMENT_METHODS.join(', ')
    );
  }
}

function generateTransactionId(): string {
  const date = new Date();
  const dateStr = date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${dateStr}-${randomNum}`;
}

function formatSuccessMessage(data: ExpenseData): string {
  return [
    '✅ 経費を登録しました',
    `金額：${data.amount.toLocaleString()}円`,
    `種別：${data.category}`,
    `支払方法：${data.paymentMethod}`,
    `メモ：${data.memo}`,
    `取引ID：${data.transactionId}`
  ].join('\n');
}
