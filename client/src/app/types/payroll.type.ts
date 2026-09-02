import { accountInterface } from "./accounts.type";


export interface payrollEmployeeDataInterface {
  _id : string,
  name :string,
  dailyShipDuration  : number, 
  comisionPercentage : number,
  role : string,
  salary : number,
  schedDay : string[]
}


export interface payslipInterface {
  date : string,
  employeeId : string,
  name : string,
  role : string,
  rate : number, 
  payType : string,
  periodFrom : string,
  periodTo : string,
  month : string,
  hrsNeeded : number,
  workHrs : number,
  otHrs : number,
  basicPay : number,
  otPay : number,
  commisions : number,
  grossPay : number,
  totalDeducstions : number,
  netPay : number,
  attendance : string,
  proofOfAcceptance : string | null
}


export interface payRollInterfaceInput {
  bussiness : string,
  payroll : payslipInterface[],
  approvedDate : string,
  preparedBy : string,
  approveBy : string,
  status : string
}


export interface payRollInterface {
  _id : string,
  bussiness : accountInterface,
  payroll : payslipInterface[],
  approvedDate : string,
  preparedBy : string,
  approveBy : string,
  status : string
}

