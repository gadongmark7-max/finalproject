import mongoose, { Schema } from 'mongoose';

const LeaveSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    bussiness : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    isPaid : { type: Boolean, required: true },
    type :{ type: String, required: true },
    date :{ type: String, required: true },
    status : { type: String, required: true },
    times :[{ type: String, required: true }],
    days : [{ type: String, required: true }],
});

export default mongoose.model('Leaves', LeaveSchema)