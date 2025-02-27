import { sheets, config } from "../config/sheets";
import * as line from "@line/bot-sdk";
import { client } from "../config/line";

interface GroupSummary {
  groupId: string;
  groupName: string;
  pictureUrl?: string;
}

interface MessageData {
  timestamp: string;
  groupId: string;
  groupName: string;
  groupPictureUrl?: string;
  userId: string;
  userName: string;
  messageType: string;
  content: string;
}

export class TalkHistoryService {
  private sheetName: string = "";
  private range: string = "";

  async saveMessage(event: line.MessageEvent): Promise<void> {
    try {
      // Get group ID from the event
      const source = event.source;
      const groupId = source.type === "group" ? source.groupId : "";
      
      if (!groupId) {
        console.error("Not a group message");
        return;
      }
      
      // Set sheet name to group ID and update range
      this.sheetName = groupId;
      this.range = `${this.sheetName}!A2:H`;
      
      // Ensure sheet exists
      await this.ensureSheetExists();
      
      const messageData = await this.createMessageData(event);
      await this.appendToSheet([this.convertToRow(messageData)]);
    } catch (error) {
      console.error("Failed to save message:", error);
      throw error;
    }
  }

  private async ensureSheetExists(): Promise<void> {
    try {
      // Get spreadsheet metadata to check if sheet exists
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: config.spreadsheetId,
      });
      
      // Check if sheet with groupId name exists
      const sheetExists = spreadsheet.data.sheets?.some(
        (sheet) => sheet.properties?.title === this.sheetName
      );
      
      // If sheet doesn't exist, create it
      if (!sheetExists) {
        console.log(`Creating new sheet for group: ${this.sheetName}`);
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: config.spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: this.sheetName,
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: 8,
                    },
                  },
                },
              },
            ],
          },
        });
        
        // Add header row
        await sheets.spreadsheets.values.update({
          spreadsheetId: config.spreadsheetId,
          range: `${this.sheetName}!A1:H1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [["Timestamp", "Group ID", "Group Name", "Group Picture URL", "User ID", "User Name", "Message Type", "Content"]],
          },
        });
      }
    } catch (error) {
      console.error("Failed to ensure sheet exists:", error);
      throw error;
    }
  }

  private async getGroupSummary(groupId: string): Promise<GroupSummary | null> {
    try {
      const response = await client.getGroupSummary(groupId);

      return {
        groupId: response.groupId,
        groupName: response.groupName,
        pictureUrl: response.pictureUrl || undefined,
      };
    } catch (error) {
      console.error("Failed to get group summary:", error);
      return null;
    }
  }

  private async createMessageData(
    event: line.MessageEvent
  ): Promise<MessageData> {
    const timestamp = new Date(event.timestamp).toISOString();
    const source = event.source;
    const groupId = source.type === "group" ? source.groupId : "";
    const userId = source.userId || "";

    let groupInfo = {
      groupName: "",
      pictureUrl: undefined as string | undefined,
    };
    if (groupId) {
      const summary = await this.getGroupSummary(groupId);
      if (summary) {
        groupInfo = {
          groupName: summary.groupName,
          pictureUrl: summary.pictureUrl,
        };
      }
    }

    // ユーザー名の取得は別途実装が必要
    const userName = "";

    const message = event.message;
    const content =
      message.type === "text"
        ? (message as line.TextEventMessage).text
        : message.type;

    return {
      timestamp,
      groupId,
      groupName: groupInfo.groupName,
      groupPictureUrl: groupInfo.pictureUrl,
      userId,
      userName,
      messageType: message.type,
      content,
    };
  }

  private convertToRow(data: MessageData): string[] {
    return [
      data.timestamp,
      data.groupId,
      data.groupName,
      data.groupPictureUrl || "",
      data.userId,
      data.userName,
      data.messageType,
      data.content,
    ];
  }

  private async appendToSheet(values: string[][]): Promise<void> {
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range: this.range,
        valueInputOption: "RAW",
        requestBody: {
          values,
        },
      });
    } catch (error) {
      console.error("Failed to append to sheet:", error);
      throw error;
    }
  }

  async handleJoinEvent(event: any): Promise<void> {
    try {
      // Get group ID from the event
      const groupId = event.source.groupId;
      
      if (!groupId) {
        console.error("Not a group join event");
        return;
      }
      
      // Set sheet name to group ID and update range
      this.sheetName = groupId;
      this.range = `${this.sheetName}!A2:H`;
      
      // Ensure sheet exists when bot joins a group
      await this.ensureSheetExists();
      
      console.log("Bot joined group:", groupId);
    } catch (error) {
      console.error("Failed to handle join event:", error);
      throw error;
    }
  }
}

export const talkHistoryService = new TalkHistoryService();
