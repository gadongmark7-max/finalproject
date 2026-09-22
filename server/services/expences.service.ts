import ExpencesModel from "../model/expences.model"
import { expencesInterfaceInput } from "../types/expences.type"


export class ExpencesService {

  static async create(data : expencesInterfaceInput) {
    return await ExpencesModel.create(data)
  }

  static async getByAccount(account : string) {
    return await ExpencesModel.find({ account }).sort({ _id: -1 })
  }

  static async getByIdForAccount(id : string, account : string) {
    return await ExpencesModel.findOne({ _id: id, account })
  }

  static async updateForAccount(
    id : string,
    account : string,
    data : Partial<expencesInterfaceInput>,
  ) {
    return await ExpencesModel.findOneAndUpdate(
      { _id: id, account },
      {
        cost: data.cost,
        description: data.description,
        date: data.date,
        category: data.category,
        notes: data.notes,
      },
      { new: true },
    )
  }

  static async deleteForAccount(id : string, account : string) {
    return await ExpencesModel.findOneAndDelete({ _id: id, account })
  }

}
