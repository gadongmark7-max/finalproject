import TransactionModel from "../model/transactions.model"
import { transactionInterface, transactionInterfaceInput } from "../types/transaction.type"


export class TransactionService {

  static async create(data : transactionInterfaceInput) {
    await TransactionModel.create(data)
  }

  static async getById(id : string) {
    return await TransactionModel.findById(id)
  }

  static async checkIfRefIdExist(refId : string) {
    return await TransactionModel.findOne({refId})
  }

  static async getBySender(sender : string) {
    return await TransactionModel.find({sender}).populate("sender").populate("receiver").sort({ _id: -1 })
  }

  static async getByReceiver(receiver : string) {
    return await TransactionModel.find({receiver}).populate("sender").populate("receiver").sort({ _id: -1 });  
  }

}