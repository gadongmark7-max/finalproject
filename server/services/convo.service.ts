import ConvoModel from "../model/convo.model";
import { convoInterface, convoInterfaceInput } from "../types/convo.type";

export class ConvoService {
  static async create(data: convoInterfaceInput) {
    return await ConvoModel.create(data);
  }

  static async get(id: string) {
    return await ConvoModel.findById(id).populate("accounts").populate("chats");
  }

  static async getByAccounts(acccounts: string[]) {
    return await ConvoModel.findOne({ accounts: { $all: acccounts } })
      .populate("accounts")
      .populate({
        path: "chats",
        populate: {
          path: "sender",
          model: "Accounts",
        },
      });
  }

  static async getByUser(userId: string) {
    return await ConvoModel.find({ accounts: { $in: [userId] } })
      .populate("accounts")
      .populate({
        path: "chats",
        populate: {
          path: "sender",
          model: "Accounts",
        },
      });
  }

  private static pending = new Map<string, Promise<string>>();

  static async getOrCreateId(accountA: string, accountB: string) {
    const key = [accountA, accountB].sort().join(":");
    const inFlight = ConvoService.pending.get(key);
    if (inFlight) return inFlight;

    const task = (async () => {
      const existing = await ConvoService.findIdByAccounts(accountA, accountB);
      if (existing) return existing;
      const created = await ConvoModel.create({
        accounts: [accountA, accountB],
        lastMessage: "none",
        chats: [],
      });
      return created._id.toString();
    })();

    ConvoService.pending.set(key, task);
    try {
      return await task;
    } finally {
      ConvoService.pending.delete(key);
    }
  }

  static async findIdByAccounts(accountA: string, accountB: string) {
    const convo = await ConvoModel.findOne({
      accounts: { $all: [accountA, accountB] },
    }).select("_id");
    return convo ? convo._id.toString() : null;
  }

  static async findForParticipant(id: string, userId: string) {
    return await ConvoModel.findOne({ _id: id, accounts: userId }).select(
      "chats",
    );
  }

  static async getChatIdsByUser(userId: string) {
    const convos = await ConvoModel.find({ accounts: userId })
      .select("chats")
      .lean();
    return convos.flatMap((convo) => convo.chats);
  }

  static async updateLastMessage(id: string, lastMessage: string) {
    return await ConvoModel.findByIdAndUpdate(id, { lastMessage });
  }

  static async pushMessage(id: string, messageId: string) {
    return await ConvoModel.findByIdAndUpdate(id, {
      $push: { chats: messageId },
    });
  }
}
