import NotificationModel from "../model/notification.model"
import { notificationInterface, notificationInterfaceInput } from "../types/notification.type"


export class NotificationService {

  static async create(data : notificationInterfaceInput) {
    await NotificationModel.create(data)
  }

  static async getById(id : string) {
    return await NotificationModel.findById(id)
  }

  static async getByAccount(id: string) {
    return await NotificationModel
        .find({ account: id })
        .sort({ _id: -1 })  
        .limit(15);       
    }

  static async getAllUnseen(accountId: string) {
    return await NotificationModel.find({
      account: accountId,
      isSeen: false
    });
  }

  static async markAllAsSeen(accountId: string) {
    return await NotificationModel.updateMany(
      { account: accountId, isSeen: false }, // filter only unseen notifications
      { $set: { isSeen: true } },           // update
      { new: true }                          // optional, returns info about update
    );
  }


}