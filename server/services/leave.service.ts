import LeaveModel from "../model/leave.model";
import { leaveInterface, leaveInterfaceInput } from "../types/leave.type";

export class LeaveService {

  static async create(data : leaveInterfaceInput) {
    return await LeaveModel.create(data)
  }

  static async getByBussiness(bussiness : string) {
    const leave = await LeaveModel.find({bussiness}).populate('account').populate('bussiness').sort({ _id: -1 })  ;
    return leave
  }

 static async get(id : string) {
    const leave = await LeaveModel.findById(id).populate('account').populate('bussiness')  ;
    return leave
  }

  static async updateStatus(id : string, status : string) {
    const leave = await LeaveModel.findByIdAndUpdate(id, {status})
    return leave
  }

    static async updateIsPaid(id : string, isPaid : string) {
    const leave = await LeaveModel.findByIdAndUpdate(id, {isPaid})
    return leave
  }
  
  


}