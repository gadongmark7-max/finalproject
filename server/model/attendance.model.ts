import mongoose, { Schema } from 'mongoose';


const AttendanceSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    bussiness :  { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    email :  { type: String, required: true },
    accountType : { type: String, required: true },
    date : { type: String, required: true },
    timeIn : { type: String, required: true },
    timeOut : { type: String, required: false },
    duration :  { type: Number, required: false },
    ot : { type: Number, required: true },
    otStatus : { type: String, required: false },
});

export default mongoose.model('Attendance', AttendanceSchema)