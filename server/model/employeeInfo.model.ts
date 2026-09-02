import mongoose, { Schema } from 'mongoose';


const EmployeeInfoSchema = new Schema({
    account : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    bussiness : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    role : { type: String, required: true },
    email : { type: String, required: true },
    permissions : [{ type: String, required: true }],
    salary : { type: Number, required: true },
    salaryType : { type: String, required: true },
    schedTime : [{ type: String, required: true }],
    schedDay : [{ type: String, required: true }],
});

export default mongoose.model('EmployeeInfo', EmployeeInfoSchema)