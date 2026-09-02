import mongoose, { Schema } from 'mongoose';


const ConvoSchema = new Schema({
    accounts : [{ type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true }],
    lastMessage : { type: String, required: true },
    chats : [{ type: mongoose.Schema.Types.ObjectId, ref: "Messages", required: true }],
});

export default mongoose.model('Convos', ConvoSchema)