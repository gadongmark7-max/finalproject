import mongoose, { Schema } from 'mongoose';

const InventoryLogchema = new Schema({
    account : { type: String, required: true },
    date : { type: String, required: true },
    time : { type: String, required: true },
    message : { type: String, required: true },
    type : { type: String, required: true },
    actionBy : { type: String, required: true }
});

export default mongoose.model('InventoryLog', InventoryLogchema)