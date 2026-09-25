import { accountInterface } from "./accounts.type"

export interface aiMaterialInterface {
    inventoryItemId : string,
    name : string,
    estimatedQuantity : number,
    unitCost : number,
    estimatedCost : number,
}

export interface aiEstimateInterface {
    category : string,
    complexity : number,
    isColored : boolean,
    bodyPart : string,
    sizeWidthCm : number,
    sizeHeightCm : number,
    hourlyRate : number,
    estimatedHours : number,
    estimatedSessions : number,
    materials : aiMaterialInterface[],
    laborCost : number,
    materialCost : number,
    totalCost : number,
    suggestedPrice : number,
    estimatedProfit : number,
    generatedAt : Date,
}

export interface postInterfaceInput {
    account : string,
    postImg : string,
    tags : string[],
    category : string,
    sessions :number[],
    price : number,
    size : number,
    bodyPart? : string,
    sizeWidthCm? : number,
    sizeHeightCm? : number,
    downPercentage : number,
    itemUsed : {
        itemId : string,
        item : string,
        qty : number,
    }[],
    aiEstimate? : aiEstimateInterface | null,
    imageHash? : string
}

export interface postInterface  {
    _id : string,
    account : accountInterface
    postImg : string,
    tags : string[],
    downPercentage : number,
    category : string,
    size : number,
    bodyPart? : string,
    sizeWidthCm? : number,
    sizeHeightCm? : number,
    sessions :number[],
    price : number,
    itemUsed : {
        itemId : string,
        item : string,
        qty : number,
    }[],
    aiEstimate? : aiEstimateInterface | null,
}
