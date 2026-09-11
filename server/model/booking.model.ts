import mongoose, { Schema } from "mongoose";

const TattooDataSchema = new mongoose.Schema(
  {
    modelUrl: { type: String, required: true },
    meshName: { type: String, required: true },

    size: { type: Number, required: true },

    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },

    rotation: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
      order: {
        type: String,
        enum: ["XYZ", "YXZ", "ZXY", "ZYX", "YZX", "XZY"],
        required: true,
      },
    },

    scale: { type: Number, required: true },

    uv: {
      u: { type: Number },
      v: { type: Number },
    },
  },
  { _id: false },
);

const BookingSchema = new Schema({
  bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "Accounts" },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  tattooImg: { type: String, required: true },
  sessions: [{ type: Number, required: true }],
  session: { type: Number, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true },
  time: [{ type: String, required: true }],
  status: { type: String, required: true },
  isReviewed: { type: Boolean, required: true },
  originalPrice: { type: Number, required: true },
  balance: { type: Number, required: true },
  itemUsed: [
    {
      itemId: { type: String, required: true },
      item: { type: String, required: true },
      qty: { type: Number, required: true },
    },
  ],
  tattooData: {
    type: TattooDataSchema,
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: ["online", "counter"],
    default: "online",
  },
});

export default mongoose.model("Bookings", BookingSchema);
