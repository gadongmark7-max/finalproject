import mongoose, { Schema } from 'mongoose';


const PayrollSchema = new Schema({
    bussiness : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    payroll : [{
      date : { type: String, required: true },
      employeeId : { type: String, required: true },
      name : { type: String, required: true },
      role : { type: String, required: true },
      rate : { type: Number, required: true }, 
      payType : { type: String, required: true },
      periodFrom : { type: String, required: false },
      periodTo : { type: String, required: false },
      month : { type: String, required: false },
      hrsNeeded : { type: Number, required: true },
      workHrs : { type: Number, required: true },
      otHrs : { type: Number, required: true },
      basicPay : { type: Number, required: true },
      otPay : { type: Number, required: true },
      commisions : { type: Number, required: true },
      grossPay : { type: Number, required: true },
      totalDeducstions : { type: Number, required: true },
      netPay : { type: Number, required: true },
      attendance : { type: String, required: true },
      proofOfAcceptance : { type: String },
    }],
    approvedDate : { type: String, required: false },
    preparedBy : { type: String, required: true },
    approveBy : { type: String, required: false },
    status : { type: String, required: true }
});

export default mongoose.model('Payrolls', PayrollSchema)