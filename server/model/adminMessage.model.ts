import mongoose, { Schema } from 'mongoose';

const AdminMessageSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    reportedAccount : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    message : { type: String, required: true },
    proof : { type: String, required: true },
    type :{ type: String, required: true },
    date :{ type: String, required: true },
    time : { type: String, required: true },
    isSeen : { type: Boolean, required: true },
});

export default mongoose.model('AdminMessages', AdminMessageSchema)