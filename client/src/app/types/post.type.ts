import { accountInterface } from "./accounts.type"
import { aiEstimateSnapshotInterface } from "./aiAnalysis.type"

export interface postInterfaceInput {
    account : string,
    postImg : string,
    downPercentage : number,
    tags : string[],
    category : string,
    sessions :number[],
    size : number,
    bodyPart? : string,
    sizeWidthCm? : number,
    sizeHeightCm? : number,
    price : number,
    itemUsed : {
        itemId : string,
        item : string,
        qty : number,
    }[],
    aiEstimate? : aiEstimateSnapshotInterface | null
}

export interface postInterface  {
    _id : string,
    account : accountInterface
    postImg : string,
    downPercentage : number,
    size : number,
    bodyPart? : string,
    sizeWidthCm? : number,
    sizeHeightCm? : number,
    tags : string[],
    category : string,
    sessions :number[],
    price : number,
    itemUsed : {
        itemId : string,
        item : string,
        qty : number,
    }[],
    aiEstimate? : aiEstimateSnapshotInterface | null,
    deletedAt? : string | null
}
