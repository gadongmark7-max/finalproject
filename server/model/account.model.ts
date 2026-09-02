import mongoose, { Schema } from 'mongoose';


const AccountSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    profile: { type: String, required: true },
    contact: { type: String, required: true },
    subscriptionExpiration: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isBan : { type: Boolean, required: true }, 
    pin : { type: String, required: false },
    location : {
        long : { type: Number, required: false },
        lat : { type: Number, required: false },
    },
});

export default mongoose.model('Accounts', AccountSchema)