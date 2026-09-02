import mongoose, { Schema } from 'mongoose';


const NotificationSchema = new Schema({
    account : { type: String, required: true },
    message : { type: String, required: true },
    type :{ type: String, required: true },
    date :{ type: String, required: true },
    time : { type: String, required: true },
    isSeen : { type: Boolean, required: true },
});

export default mongoose.model('Notifications', NotificationSchema)