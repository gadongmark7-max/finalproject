import mongoose, { Schema } from 'mongoose';

const Inventorychema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    item : { type: String, required: true },
    category : { type: String, required: true },
    stocks : { type: Number, required: true },
    type : { type: String, required: true },
    safeStock : { type: Number, required: true },
    price : { type: Number, required: true },
});

export default mongoose.model('Inventory', Inventorychema)