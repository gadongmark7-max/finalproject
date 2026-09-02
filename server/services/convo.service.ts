import ConvoModel from "../model/convo.model"
import { convoInterface, convoInterfaceInput } from "../types/convo.type"


export class ConvoService {

  static async create(data : convoInterfaceInput) {
    return await ConvoModel.create(data)
  }

  static async get(id : string) {
    return await ConvoModel.findById(id).populate("accounts").populate("chats")
  }

  static async getByAccounts(acccounts : string[]) {
    return await ConvoModel.findOne({accounts : { $all : acccounts }}).populate("accounts").populate({
      path: "chats",
      populate: {
        path: "sender",
        model: "Accounts",
      },
    });
  }

  static async getByUser(userId : string) {
    return await ConvoModel.find({accounts : { $in : [userId] }}).populate("accounts").populate({
      path: "chats",
      populate: {
        path: "sender",
        model: "Accounts",
      },
    });
  }

  static async updateLastMessage(id : string, lastMessage : string) {
    return await ConvoModel.findByIdAndUpdate(id, { lastMessage })
  }

  static async pushMessage(id : string, messageId : string) {
    return await ConvoModel.findByIdAndUpdate(id, { $push: { chats: messageId } })
  }


 

}
