import mongoose, { Schema } from 'mongoose';


const EmployeeInfoSchema = new Schema(
  {
    fullname : String,
    email : String,
    contact : String,
    dateOfBirth : String,
    Gender : String,
    civilStatus : String,
    address : String,
    TIN : String,
    SSS : String,
    PhilHealth : String,
    PagIbig : String,
  },
  { _id: false }
);


const BussinessInfoSchema = new Schema({
    bio : { type: String, required: true },
    bussiness : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    isLookingArtist : { type: Boolean, required: true },
    jobDescription : { type: String, required: false },
    config : {
        artistPayment : { type: Boolean, required: true },
        financeApproval : { type: Boolean, required: true },
        overTimePayment : { type: Boolean, required: true },
        artistToOtherBussiness : { type: Boolean, required: true },
        artistPost : { type: Boolean, required: true },
        artistBookAppointment : { type: Boolean, required: true },
    },
    artists : [{
        artist : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
        schedTime : [{ type: String, required: true }],
        schedDay : [{ type: String, required: true }],
        commision : { type: Number, required: true },
        salary : { type: Number, required: true },
        salaryType : { type: String, required: true },
        info : EmployeeInfoSchema
    }],
    employees : [{
        employee : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
        employeeInfo : { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeInfo", required: true },
        info : EmployeeInfoSchema
    }],
    roles : [{
        role : { type: String, required: true },
        permissions : [{ type: String, required: true }]
    }],
    profileImages : [{
        type : { type: String, required: true },
        fileUrl : String,
        fileType : String
    }],
    reviews : [{
        client : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
        comment : { type: String, required: true },
        img : { type: String, required: true },
        rating : { type: Number, required: true },
    }],
});

export default mongoose.model('BussinessInfo', BussinessInfoSchema)




       