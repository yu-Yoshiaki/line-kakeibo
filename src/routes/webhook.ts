import { Hono } from 'hono';
import { webhookHandler } from '../handlers/webhook-handler';

const router = new Hono();

// Webhookエンドポイントの設定
router.post('/webhook', webhookHandler);

export default router;
