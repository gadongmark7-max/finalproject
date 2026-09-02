import AdminMessageModel from "../model/adminMessage.model"
import { adminMessageInterface, adminMessageInterfaceInput } from "../types/adminMessage.type";

export class AdminMessageService {

  static async create(data : adminMessageInterfaceInput) {
    await AdminMessageModel.create(data)
  }

  static async getAll() {
    return await AdminMessageModel.find().sort({ _id: -1 }).limit(15).populate("account").populate("reportedAccount") 
  }


 
  static async getAllUnseen() {
    return await AdminMessageModel.find({
      isSeen: false
    });
  }

  static async markAllAsSeen() {
    return await AdminMessageModel.updateMany(
      { isSeen: false }, // filter only unseen notifications
      { $set: { isSeen: true } },           // update
      { new: true }                          // optional, returns info about update
    );
  }


}