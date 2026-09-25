import mongoose, { Schema } from 'mongoose';

export const EXPENSE_CATEGORIES = [
    "Ink",
    "Needles & Cartridges",
    "Gloves",
    "Equipment",
    "Tattoo Machines",
    "Studio Supplies",
    "Aftercare Supplies",
    "Rent",
    "Utilities",
    "Marketing",
    "Other",
] as const;

const ExpencesSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    cost : { type: Number, required: true },
    description : { type: String, required: true },
    date : { type: String, required: true },
    recordedBy : { type: String, required: true },
    category : { type: String, enum: EXPENSE_CATEGORIES, default: "Other" },
    notes : { type: String, required: false },
}, { timestamps: true });


export default mongoose.model('Expences', ExpencesSchema)