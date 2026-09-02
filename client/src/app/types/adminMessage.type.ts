import { accountInterface } from "./accounts.type";



export interface adminMessageInterfaceInput {
  account : string,
  reportedAccount :  string,
  message : string,
  proof : string,
  type : string,
  date : string,
  time :  string,
  isSeen : boolean,
}



export interface adminMessageInterface{
  _id : string,
  account : accountInterface,
  reportedAccount : accountInterface,
  message : string,
  proof : string,
  type : string,
  date : string,
  time :  string,
  isSeen : boolean,
}