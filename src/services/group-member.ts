import { sheets, config } from "../config/sheets";

interface GroupMember {
  userId: string;
  name: string;
  group: string;
  joinedAt: string;
}

export class GroupMemberService {
  private static readonly SHEET_NAME = "メンバー";
  private static readonly RANGE = "A2:D";

  /**
   * メンバーをスプレッドシートに登録
   */
  async registerMember(member: GroupMember): Promise<void> {
    try {
      // 既存のメンバーを確認
      const existingMembers = await this.fetchMembers();
      const existingMember = existingMembers.find(
        (m) => m.userId === member.userId
      );

      if (existingMember) {
        throw new Error("このメンバーは既に登録されています");
      }

      // 新しい行を追加
      await sheets.spreadsheets.values.append({
        spreadsheetId: config.spreadsheetId,
        range: `${GroupMemberService.SHEET_NAME}!${GroupMemberService.RANGE}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[member.userId, member.name, member.group, member.joinedAt]],
        },
      });
    } catch (error) {
      console.error("Error registering member:", error);
      throw error;
    }
  }

  /**
   * メンバーシートからデータを取得
   */
  async fetchMembers(): Promise<GroupMember[]> {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.spreadsheetId,
        range: `${GroupMemberService.SHEET_NAME}!${GroupMemberService.RANGE}`,
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      // ヘッダー行をスキップしてデータを変換
      return rows.slice(1).map((row) => ({
        userId: row[0] || "",
        name: row[1] || "",
        group: row[2] || "",
        joinedAt: row[3] || "",
      }));
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  }

  /**
   * グループメンバー一覧を取得
   */
  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const members = await this.fetchMembers();
    return members.filter((member) => member.group === groupId);
  }
}
