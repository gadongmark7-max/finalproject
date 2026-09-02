import attendanceModel from "../model/attendance.model";
import Attendance from "../model/attendance.model"
import { attendanceInterface, attendanceInterfaceInput } from "../types/attendance.type";
import { getDuration } from "../utils/customFunction";

export class AttendanceService {

  static async create(data : attendanceInterfaceInput) {
    return await Attendance.create(data)
  }

  static async getByBussiness(bussiness : string) {
    const attendance = await Attendance.find({bussiness}).populate('account').populate('bussiness').sort({ _id: -1 })  ;
    return attendance
  }

   static async getByEmail(email : string) {
    const attendance = await Attendance.find({email}).populate('account').populate('bussiness').sort({ _id: -1 })  ;
    return attendance
  }


  static async checkIfExist(email : string, date : string) {
    const attendance = await Attendance.findOne({email, date}).populate('account').populate('bussiness').sort({ _id: -1 })  ;
    return !!attendance
  }

  static async updateTimeOut(id : string, timeOut : string, duration : number) {
    const attendance = await Attendance.findById(id)
    if(!attendance) return
    attendance.timeOut = timeOut
    if(getDuration(attendance.timeIn, timeOut) > duration){
      attendance.duration = duration
      attendance.ot = getDuration(attendance.timeIn, timeOut) - duration
    } else {
      attendance.duration = getDuration(attendance.timeIn, timeOut)
    }
    await attendance.save()
  }


  static async updateOtTo0(id : string) {
    await attendanceModel.findByIdAndUpdate(id, {ot : 0})
  }

  static async addOtToDuration(id : string) {
    const attendance = await attendanceModel.findById(id)
    if(!attendance || !attendance.duration) return
    attendance.duration += attendance.ot
    attendance.ot = 0
    await attendance.save()
  }

  static async updateStatus(id : string, otStatus : string) {
    await attendanceModel.findByIdAndUpdate(id, {otStatus})
  }


}