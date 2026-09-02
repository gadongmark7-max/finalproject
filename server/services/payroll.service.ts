import PayrollModel from "../model/payroll.model"
import { payRollInterface, payRollInterfaceInput } from "../types/payroll.type"
import { getDate } from "../utils/customFunction"

export class PayrollService {

  static async create(data : payRollInterfaceInput) {
    return await PayrollModel.create(data)
  }

  static async get(id : string) {
    return await PayrollModel.findById(id).populate("bussiness")
  }

  static async getAll() {
    return await PayrollModel.find().populate("bussiness")
  }
  
  static async getByBusssiness(bussiness : string) {
    return await PayrollModel.find({bussiness}).populate("bussiness")
  }

  static async approve(id : string, approveBy : string) {
    return await PayrollModel.findByIdAndUpdate(id ,{date : getDate(), status : "approved", approveBy : approveBy }, { new  :true})
  }

  static async reject(id : string) {
    return await PayrollModel.findByIdAndUpdate(id ,{date : getDate(), status : "rejected" }, { new  :true})
  }

  static async addProof(id: string, payrollId: string, url: string) {
  return await PayrollModel.updateOne(
    { _id: id, "payroll._id": payrollId },
    {
      $set: {
        "payroll.$.proofOfAcceptance": url
      }
    }
  );
}

}