import { accountInterface } from "./accounts.type";
import { TattooDataInterface } from "./threejs.type";

export interface bookingInterfaceInput {
    bussiness : string | null,
    artist : string,
    client : string,  
    tattooImg : string,
    sessions : number[],
    session : number,
    date : string,
    time : string[],
    duration : number,
    status : string,
    isReviewed : boolean,
    originalPrice : number,
    balance : Number,
    itemUsed : {
        item : string,
        qty : number,
    }[],
    tattooData : TattooDataInterface | null,
    paymentMethod? : "online" | "counter",
    sessionMaterials? : PlannedSessionMaterials[]
}

export interface PlannedSessionMaterials {
    session : number,
    items : { itemId : string, item : string, unit : string, qty : number }[]
}

export interface bookingInterface{
    _id : string,
    bussiness : accountInterface | null,
    artist : accountInterface,
    client : accountInterface,  
    tattooImg : string,
    sessions : number[], 
    session : number,
    date : string,
    time : string[]
    duration : number,
    status : string,
    isReviewed : boolean,
    originalPrice : number,
    balance : Number,
    itemUsed : {
        item : string,
        qty : number,
    }[],
    tattooData : TattooDataInterface | null,
    paymentMethod? : "online" | "counter",
    paymentStatus? : "awaiting" | "partial" | "paid"
}

