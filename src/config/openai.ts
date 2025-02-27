import OpenAI from 'openai';

// OpenAI API設定
export const config = {
  apiKey: process.env.OPENAI_API_KEY || '',
};

// OpenAIクライアントのインスタンス
export const openai = new OpenAI({
  apiKey: config.apiKey,
});
