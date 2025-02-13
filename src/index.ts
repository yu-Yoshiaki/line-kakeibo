import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config";
import webhookRouter from './routes/webhook';

const app = new Hono();

// ルートの設定
app.route('/', webhookRouter);

// ヘルスチェックエンドポイント
app.get("/", (c) => c.text("LINE家計簿 API is running!"));

console.log(`Server is running on port ${config.server.port}`);
serve({
  fetch: app.fetch,
  port: config.server.port,
});
