import { GroupMemberService } from '../services/group-member';
import * as line from '@line/bot-sdk';
import { client } from '../config/line';

interface GroupMemberProfile {
  displayName: string;
  userId: string;
  pictureUrl?: string;
}

export class GroupMemberHandler {
  private groupMemberService: GroupMemberService;

  constructor() {
    this.groupMemberService = new GroupMemberService();
  }

  /**
   * LINEメッセージからメンバー登録を処理
   */
  async handleMemberRegistration(event: line.MessageEvent): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // メッセージがテキストでない場合は処理しない
      if (event.message.type !== 'text') {
        return {
          success: false,
          message: 'テキストメッセージを送信してください',
        };
      }

      // グループメッセージでない場合は処理しない
      if (event.source.type !== 'group') {
        return {
          success: false,
          message: 'この機能はグループでのみ使用できます',
        };
      }

      // メッセージの形式を確認（例: "メンバー登録"）
      const text = event.message.text;
      const match = text.match(/^メンバー登録$/);
      if (!match) {
        return {
          success: false,
          message: '「メンバー登録」と入力してください',
        };
      }

      const userId = event.source.userId;
      const groupId = event.source.type === 'group' ? event.source.groupId : undefined;

      if (!userId || !groupId) {
        return {
          success: false,
          message: 'ユーザーIDまたはグループIDが取得できませんでした',
        };
      }

      // グループメンバーのプロフィールを取得
      const profile = await this.getGroupMemberProfile(groupId, userId);
      if (!profile) {
        return {
          success: false,
          message: 'プロフィール情報の取得に失敗しました',
        };
      }

      // メンバー登録
      await this.groupMemberService.registerMember({
        userId,
        name: profile.displayName,
        group: groupId,
        joinedAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: `${profile.displayName}さんをメンバーとして登録しました`,
      };
    } catch (error) {
      console.error('メンバー登録処理でエラーが発生しました:', error);
      return {
        success: false,
        message: (error as Error).message || 'メンバー登録処理でエラーが発生しました',
      };
    }
  }

  /**
   * グループメンバー一覧を取得
   */
  async getGroupMembers(groupId: string): Promise<{
    success: boolean;
    message: string;
    members?: { name: string; joinedAt: string }[];
  }> {
    try {
      const members = await this.groupMemberService.getGroupMembers(groupId);
      
      if (members.length === 0) {
        return {
          success: true,
          message: 'このグループにはメンバーが登録されていません',
        };
      }

      return {
        success: true,
        message: `グループメンバー一覧（${members.length}名）`,
        members: members.map(m => ({ name: m.name, joinedAt: m.joinedAt })),
      };
    } catch (error) {
      console.error('メンバー一覧取得でエラーが発生しました:', error);
      return {
        success: false,
        message: 'メンバー一覧の取得に失敗しました',
      };
    }
  }

  /**
   * グループメンバーのプロフィールを取得
   */
  private async getGroupMemberProfile(groupId: string, userId: string): Promise<GroupMemberProfile | null> {
    try {
      const profile = await client.getGroupMemberProfile(groupId, userId);
      return {
        displayName: profile.displayName,
        userId: profile.userId,
        pictureUrl: profile.pictureUrl,
      };
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
      return null;
    }
  }
}
