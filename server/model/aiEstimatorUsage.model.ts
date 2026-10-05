import mongoose, { Schema } from "mongoose";

const AiEstimatorUsageSchema = new Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accounts",
      required: true,
      unique: true,
    },
    used: { type: Number, required: true, min: 0 },
    cooldownUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("AiEstimatorUsage", AiEstimatorUsageSchema);
