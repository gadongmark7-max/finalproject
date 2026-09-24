import MessageModel from "../model/messages.model";
import { messageInterface, messageInterfaceInput } from "../types/convo.type";

export class MessageService {
  static async create(data: messageInterfaceInput) {
    return await MessageModel.create(data);
  }

  static async countUnread(chatIds: unknown[], userId: string) {
    if (chatIds.length === 0) return 0;
    return await MessageModel.countDocuments({
      _id: { $in: chatIds },
      sender: { $ne: userId },
      seen: false,
    });
  }

  static async markRead(chatIds: unknown[], userId: string) {
    if (chatIds.length === 0) return;
    await MessageModel.updateMany(
      { _id: { $in: chatIds }, sender: { $ne: userId }, seen: false },
      { seen: true },
    );
  }
}
