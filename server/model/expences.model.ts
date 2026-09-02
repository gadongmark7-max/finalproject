import mongoose, { Schema } from 'mongoose';


const ExpencesSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    cost : { type: Number, required: true },
    description : { type: String, required: true },
    date : { type: String, required: true },
    recordedBy : { type: String, required: true },
});


export default mongoose.model('Expences', ExpencesSchema)