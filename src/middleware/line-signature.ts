import { Context, Next } from 'hono';
import { validateSignature } from '@line/bot-sdk';
import { config } from '../config';

export async function lineSignatureMiddleware(c: Context, next: Next) {
  const signature = c.req.header('x-line-signature');
  if (!signature) {
    return c.text('Signature missing', 400);
  }

  const body = await c.req.text();
  if (!validateSignature(body, config.line.channelSecret, signature)) {
    return c.text('Invalid signature', 403);
  }

  await next();
}
