import DocumentModel from "../model/documents.model"
import { documentInterface, documentInterfaceInput } from "../types/document.type"


export class DocumentService {

  static async create(data : documentInterfaceInput) {
    return await DocumentModel.create(data)
  }

  static async get(id : string) {
    return await DocumentModel.findById(id).populate("bussiness")
  }

  static async getByAccount(id : string) {
    return await DocumentModel.findOne({bussiness : id}).populate("bussiness")
  }

  
static async updateDocs(
  id: string,
  docs: string,
  url: string,
  expiration: string // optional
) {
  const document = await DocumentModel.findById(id);
  if (!document) return;

  switch (docs) {
    case "bussinessPermit":
      document.bussinessPermit = {
        url: url,
        expiration: expiration, 
      };
      break;

    case "BarangayClearance":
      document.BarangayClearance = {
        url: url,
        expiration: expiration,
      };
      break;

    case "MayorPermit":
      document.MayorPermit = {
        url: url,
        expiration: expiration,
      };
      break;

    case "sanitaryPermit":
      document.sanitaryPermit = {
        url: url,
        expiration: expiration,
      };
      break;

    case "HealthPermit":
      document.HealthPermit = {
        url: url,
        expiration: expiration,
      };
      break;

    case "BIRRegistarion":
      document.BIRRegistarion = {
        url: url,
      };
      break;

    case "DTIRegistarion":
      document.DTIRegistarion = {
        url: url,
      };
      break;

    case "SECRegistarion":
      document.SECRegistarion = {
        url: url,
      };
      break;

    default:
      throw new Error(`Unknown document type: ${docs}`);
  }

  await document.save();
}

}