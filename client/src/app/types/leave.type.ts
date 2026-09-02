import { accountInterface } from "./accounts.type";


export interface leaveInterfaceInput { 
    account : string,
    bussiness : string,
    isPaid : boolean,
    type :string,
    date :string,
    status : string,
    times :string[]
    days : string[]
}

export interface leaveInterface { 
    _id : string,
    account : accountInterface,
    bussiness : accountInterface,
    isPaid : boolean,
    type :string,
    date :string,
    status : string,
    times :string[]
    days : string[]
}