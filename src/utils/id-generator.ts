/**
 * 取引IDを生成する
 * フォーマット: YYYYMMDD-XXX (XXXは3桁の連番)
 */
export function generateTransactionId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${year}${month}${day}-${random}`;
}
