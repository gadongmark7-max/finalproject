import WorksModel from "../model/works.model"
import { worksInterfaceInput, worksInterface, designInterface } from "../types/works.type"


export class WorksService {

  static async create(data : worksInterfaceInput) {
    await WorksModel.create(data)
  }

  static async getById(id : string) {
    return await WorksModel.findById(id)
  }

  static async getByArtist(artist : string) {
    return await WorksModel.find({artist})
  }

  static async delete(id : string) {
    return await WorksModel.findByIdAndDelete(id)
  }

  static async updateWorks(id : string, design : designInterface, screenShot : string) {
    return WorksModel.findByIdAndUpdate(id, {design, screenShot})
  }


}
