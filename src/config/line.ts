import * as line from "@line/bot-sdk";

// LINE SDK config
export const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

// LINE SDK client
export const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});
