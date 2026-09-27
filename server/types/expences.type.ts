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
    | "Inventory Usage"
    | "Other";

export type ExpenseSource = "manual" | "booking_inventory";

export interface expencesInterfaceInput {
    account : string,
    cost : number,
    description : string,
    date : string,
    recordedBy : string,
    category? : ExpenseCategory,
    notes? : string,
    source? : ExpenseSource,
    booking? : string,
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
    source? : ExpenseSource,
    booking? : string | null,
    createdAt? : string,
    updatedAt? : string,
}
