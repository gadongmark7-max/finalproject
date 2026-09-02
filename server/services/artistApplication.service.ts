import ArtistApplicationModel from "../model/artistApplication.model"
import { artistApplicationInterface , artistApplicationInterfaceInput} from "../types/accounts.type";


export class ArtistApplicationService {

  static async create(data : artistApplicationInterfaceInput) {
    return await ArtistApplicationModel.create(data)
  }

  static async getAll() {
    const applications = ArtistApplicationModel.find().populate("artist").populate("bussiness");
    return applications
  }

  static async get(id : string) {
    const application = ArtistApplicationModel.findById(id).populate("artist").populate("bussiness");
    return application
  }

  static async getByBussiness(bussiness : string) {
    const application = ArtistApplicationModel.find({bussiness}).populate("artist").populate("bussiness");
    return application
  }

  static async delete(id : string) {
    await ArtistApplicationModel.findByIdAndDelete(id)
  }

}