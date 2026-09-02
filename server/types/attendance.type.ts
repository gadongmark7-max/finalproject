import { accountInterface } from "./accounts.type";


export interface attendanceInterfaceInput{
  account : string,
  bussiness : string,
  email : string,
  accountType : string,
  date : string,
  timeIn : string,
  timeOut : string | null,
  duration :  number,
  ot : number,
  otStatus : string
}

export interface attendanceInterface{
  _id : string,
  account : accountInterface,
  bussiness : accountInterface,
  accountType : string,
  email : string,
  date : string,
  timeIn : string,
  timeOut : string | null,
  duration :  number,
  ot : number,
  otStatus : string
}















