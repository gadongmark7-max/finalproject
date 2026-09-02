import { accountInterface } from "./accounts.type"

export interface messageInterfaceInput {
    sender : string,
    message : string,
    type : string,
    url : string,
}

export interface messageInterface {
    _id : string,
    sender : string,
    message : string,
    type : string,
    url : string,
}

export interface convoInterfaceInput {
    accounts : string[],
    lastMessage : string,
    chats : string[],
}

export interface convoInterface {
    _id : string,
    accounts : accountInterface[],
    lastMessage : string,
    chats : messageInterface[],
}

  