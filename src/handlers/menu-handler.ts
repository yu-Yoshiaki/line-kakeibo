import { TextMessage } from '@line/bot-sdk';

export function handleMenuMessage(): TextMessage {
  const menuItems = [
    '📝 使用可能なコマンド',
    '',
    '1️⃣ 収入登録',
    '   収入 [金額] [収入種別] [取引先] [メモ]',
    '   例：収入 250000 給与 株式会社ABC 1月分給与',
    '',
    '2️⃣ 支出登録',
    '   [項目名] [金額]',
    '   例：ランチ 1000',
    '',
    '3️⃣ ヘルプ',
    '   「メニュー」または「ヘルプ」と入力',
    '',
    '💡 収入種別一覧：',
    '   - 事業収入',
    '   - 給与',
    '   - 副収入',
    '   - その他収入'
  ].join('\n');

  return {
    type: 'text',
    text: menuItems
  };
}
