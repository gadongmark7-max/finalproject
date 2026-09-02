import mongoose, { Schema } from 'mongoose';


const TransactionSchema = new Schema({
    sender : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    receiver : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    date : { type: String, required: true },
    time :{ type: String, required: true },
    refId :{ type: String, required: true },
    amount : { type: Number, required: true },
});

export default mongoose.model('Transactions', TransactionSchema)