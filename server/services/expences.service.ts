import ExpencesModel from "../model/expences.model"
import { expencesInterface, expencesInterfaceInput } from "../types/expences.type"


export class ExpencesService {

  static async create(data : expencesInterfaceInput) {
    return await ExpencesModel.create(data)
  }

  static async getByAccount(account : string) {
    return await ExpencesModel.find({ account })
  }

}