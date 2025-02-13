import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { config } from "./config";
import { lineSignatureMiddleware } from "./middleware/line-signature";

const app = new Hono();

// LINEのWebhookエンドポイント
app.post("/webhook", lineSignatureMiddleware, async (c) => {
  // TODO: Implement webhook handler
  return c.text("OK");
});

// ヘルスチェックエンドポイント
app.post("/", (c) => c.text("LINE家計簿 API is running!"));

console.log(`Server is running on port ${config.server.port}`);
serve({
  fetch: app.fetch,
  port: config.server.port,
});
