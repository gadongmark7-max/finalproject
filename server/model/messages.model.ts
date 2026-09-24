import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  message: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  seen: { type: Boolean, default: false },
});

export default mongoose.model("Messages", MessageSchema);
