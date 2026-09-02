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
    originalPrice : number,
    status : string,
    isReviewed : boolean,
    balance : Number,
    itemUsed : {
        item : string,
        qty : number,
    }[],
    tattooData : TattooDataInterface | null
}
 
export interface bookingInterface{
    _id : string,
    bussiness : accountInterface | null,
    artist : accountInterface,
    client : accountInterface,  
    tattooImg : string,
    sessions : number[], 
    session : number,
    originalPrice : number,
    date : string,
    time : string[]
    duration : number,
    status : string,
    isReviewed : boolean,
    balance : number,
    itemUsed : {
        item : string,
        qty : number,
    }[],
    tattooData : TattooDataInterface | null
}
 
