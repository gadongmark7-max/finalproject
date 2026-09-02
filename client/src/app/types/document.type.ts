import { accountInterface } from "./accounts.type";

export interface documentInterfaceInput {
    bussiness : string,
    bussinessPermit : {
      url : string,
      expiration : string,
    }| null, 
    BarangayClearance : {
      url : string,
      expiration : string,
    } | null, 
    MayorPermit : {
      url : string,
      expiration : string,
    } | null, 
    sanitaryPermit : {
      url : string,
      expiration : string,
    } | null, 
    HealthPermit : {
      url : string,
      expiration : string,
    } | null, 
    BIRRegistarion : {
      url : string,
    } | null, 
    DTIRegistarion : {
      url : string,
    } | null, 
    SECRegistarion : {
      url : string,
    } | null,   
}


export interface documentInterface {
    _id : string,
    bussiness : string,
    bussinessPermit : {
      url : string,
      expiration : string,
    }| null, 
    BarangayClearance : {
      url : string,
      expiration : string,
    } | null, 
    MayorPermit : {
      url : string,
      expiration : string,
    } | null, 
    sanitaryPermit : {
      url : string,
      expiration : string,
    } | null, 
    HealthPermit : {
      url : string,
      expiration : string,
    } | null, 
    BIRRegistarion : {
      url : string,
    } | null, 
    DTIRegistarion : {
      url : string,
    } | null, 
    SECRegistarion : {
      url : string,
    } | null,   
}