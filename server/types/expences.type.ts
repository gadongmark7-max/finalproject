export type ExpenseCategory =
    | "Ink"
    | "Needles & Cartridges"
    | "Gloves"
    | "Equipment"
    | "Tattoo Machines"
    | "Studio Supplies"
    | "Aftercare Supplies"
    | "Rent"
    | "Utilities"
    | "Marketing"
    | "Other";

export interface expencesInterfaceInput {
    account : string,
    cost : number,
    description : string,
    date : string,
    recordedBy : string,
    category? : ExpenseCategory,
    notes? : string,
}

export interface expencesInterface {
    _id : string,
    account : string,
    cost : number,
    description : string,
    date : string,
    recordedBy : string,
    category? : ExpenseCategory,
    notes? : string,
    createdAt? : string,
    updatedAt? : string,
}
