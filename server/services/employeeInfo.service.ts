import EmployeeInfoModel from "../model/employeeInfo.model"
import { employeeInterface, employeeInterfaceInput } from "../types/accounts.type"


export class EmployeeInfoService {

  static async create(data : employeeInterfaceInput) {
    return await EmployeeInfoModel.create(data)
  }

  static async get(id : string) {
    return await EmployeeInfoModel.findById(id).populate("account").populate("bussiness")
  }

  static async delete(employeeId : string,  businessId  :string) {
    return await EmployeeInfoModel.deleteOne({ account : employeeId, bussiness : businessId})
  }

  static async getByEmail(email : string) {
    return await EmployeeInfoModel.findOne({email}).populate("account").populate("bussiness")
  }

  static async updateRole(id : string,  role : string, permissions : string[]) {
    return await EmployeeInfoModel.findByIdAndUpdate(id, {permissions, role})
  }

  static async updateSched(account : string, schedDay : string[], schedTime : string[], salary : number, salaryType : string) {
    const info = await EmployeeInfoModel.findOne({ account })
    if(!info) return
    info.schedDay = schedDay
    info.schedTime = schedTime
    info.salary = salary
    info.salaryType = salaryType
    await info.save()
  }



}