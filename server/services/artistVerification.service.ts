import ArtistVerification from "../model/artistVerification.model"
import { artistVerificationInterface , artistVerificationInterfaceInput} from "../types/accounts.type";


export class ArtistVerificationServices {

  static async create(data : artistVerificationInterfaceInput) {
    return await ArtistVerification.create(data)
  }

  static async getAll() {
    const artistVerifiactions = await ArtistVerification.find().populate('client');
    return artistVerifiactions
  }

  static async get(id : string) {
    const artistVerifiactions = ArtistVerification.findById(id).populate('client');
    return artistVerifiactions
  }

  static async delete(id : string) {
    return await ArtistVerification.findByIdAndDelete(id)
  }

}