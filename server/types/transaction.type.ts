import { accountInterface } from "./accounts.type";

export interface transactionInterfaceInput {
    sender : string,
    receiver : string,
    date : string,
    time :string,
    refId :string,
    amount : number,
}


export interface transactionInterface {
    _id : string,
    sender : accountInterface,
    receiver : accountInterface,
    date : string,
    time :string,
    refId :string,
    amount : number,
}