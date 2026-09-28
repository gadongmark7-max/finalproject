import mongoose, { Schema } from 'mongoose';


const AccountSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    profile: { type: String, required: true },
    contact: { type: String, required: true },
    subscriptionExpiration: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    isBan : { type: Boolean, required: true }, 
    pin : { type: String, required: false, select: false },
    accessCodeHash : { type: String, required: false, select: false },
    accessCodeFailedAttempts : { type: Number, default: 0, select: false },
    accessCodeLockedUntil : { type: Date, default: null, select: false },
    location : {
        long : { type: Number, required: false },
        lat : { type: Number, required: false },
    },
}, {
    toJSON: {
        transform: (_doc, ret: Record<string, unknown>) => {
            delete ret.password;
            delete ret.pin;
            delete ret.accessCodeHash;
            delete ret.accessCodeFailedAttempts;
            delete ret.accessCodeLockedUntil;
            return ret;
        },
    },
});

export default mongoose.model('Accounts', AccountSchema)