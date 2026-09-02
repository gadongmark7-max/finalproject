import mongoose, { Schema } from 'mongoose';


const PostSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    downPercentage :  { type: Number, required: true },
    price : { type: Number, required: true },
    postImg : { type: String, required: true },
    size : { type: Number, required: false },
    tags : [{ type: String, required: true }],
    category : { type: String, required: true },
    sessions : [{ type: Number, required: true }],
    itemUsed : [{
        itemId : { type: String, required: true },
        item : { type: String, required: true },
        qty : { type: Number, required: true },
    }]
});

export default mongoose.model('Posts', PostSchema)