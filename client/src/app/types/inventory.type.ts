import { accountInterface } from "./accounts.type";

export interface inventoryInterfaceInput {
    account : string,
    item : string,
    category : string,
    stocks : number,
    type : string,
    safeStock : number,
    price : number,
}

  

export interface inventoryInterface {
    _id : string,
    account : accountInterface,
    item : string,
    category : string,
    stocks : number,
    type : string,
    safeStock : number,
    price : number,
}




export interface inventoryLogInterfaceInput {
    account : string,
    date :string,
    time :string,
    message : string,
    type :string,
    actionBy :string
}

export interface inventoryLogInterface {
    _id : string,
    account : string,
    date :string,
    time :string,
    message : string,
    type :string,
    actionBy :string
}