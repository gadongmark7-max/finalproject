import TransactionModel from "../model/transactions.model";
import BookingModel from "../model/booking.model";
import {
  transactionInterface,
  transactionInterfaceInput,
} from "../types/transaction.type";

const BOOKING_LIST_FIELDS =
  "tattooImg originalPrice balance date time duration status session paymentMethod";

export class TransactionService {
  static async create(data: transactionInterfaceInput) {
    return await TransactionModel.create(data);
  }

  static async deleteById(id: string) {
    await TransactionModel.findByIdAndDelete(id);
  }

  static async getById(id: string) {
    return await TransactionModel.findById(id);
  }

  static async getByIdPopulated(id: string) {
    return await TransactionModel.findById(id)
      .populate("sender")
      .populate("receiver")
      .populate("bookingId");
  }

  static async checkIfRefIdExist(refId: string) {
    return await TransactionModel.findOne({ refId });
  }

  static async getBySender(sender: string) {
    return await TransactionModel.find({ sender })
      .populate("sender")
      .populate("receiver")
      .populate("bookingId", BOOKING_LIST_FIELDS)
      .sort({ _id: -1 });
  }

  static async getByReceiver(receiver: string) {
    return await TransactionModel.find({ receiver })
      .populate("sender")
      .populate("receiver")
      .sort({ _id: -1 });
  }

  static async getByReceiverOrBookingArtist(accountId: string) {
    const bookingIds = await BookingModel.find({ artist: accountId }).distinct(
      "_id",
    );
    return await TransactionModel.find({
      $or: [{ receiver: accountId }, { bookingId: { $in: bookingIds } }],
    })
      .populate("sender")
      .populate("receiver")
      .populate("bookingId", BOOKING_LIST_FIELDS)
      .sort({ _id: -1 });
  }
}
