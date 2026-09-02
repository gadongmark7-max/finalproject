import MessageModel from "../model/messages.model"
import { messageInterface, messageInterfaceInput } from "../types/convo.type"


export class MessageService {

  static async create(data : messageInterfaceInput) {
    return await MessageModel.create(data)
  }


 

}
