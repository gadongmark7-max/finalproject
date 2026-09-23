import mongoose, { Schema } from "mongoose";

const AiMaterialSchema = new Schema(
  {
    inventoryItemId: { type: String, required: true },
    name: { type: String, required: true },
    estimatedQuantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    estimatedCost: { type: Number, required: true },
  },
  { _id: false },
);

const AiEstimateSchema = new Schema(
  {
    category: { type: String, required: true },
    complexity: { type: Number, required: true },
    isColored: { type: Boolean, required: true },
    bodyPart: { type: String, required: true },
    sizeWidthCm: { type: Number, required: true },
    sizeHeightCm: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    estimatedHours: { type: Number, required: true },
    estimatedSessions: { type: Number, required: true },
    materials: [AiMaterialSchema],
    laborCost: { type: Number, required: true },
    materialCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    suggestedPrice: { type: Number, required: true },
    estimatedProfit: { type: Number, required: true },
    generatedAt: { type: Date, required: true },
  },
  { _id: false },
);

const PostSchema = new Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
    required: true,
  },
  downPercentage: { type: Number, required: true },
  price: { type: Number, required: true },
  postImg: { type: String, required: true },
  size: { type: Number, required: false },
  bodyPart: { type: String, required: false },
  sizeWidthCm: { type: Number, required: false },
  sizeHeightCm: { type: Number, required: false },
  tags: [{ type: String, required: true }],
  category: { type: String, required: true },
  sessions: [{ type: Number, required: true }],
  itemUsed: [
    {
      itemId: { type: String, required: true },
      item: { type: String, required: true },
      qty: { type: Number, required: true },
    },
  ],
  aiEstimate: { type: AiEstimateSchema, required: false, default: null },
  deletedAt: { type: Date, default: null },
  imageHash: { type: String, required: false },
});

PostSchema.index(
  { imageHash: 1 },
  {
    unique: true,
    partialFilterExpression: {
      imageHash: { $type: "string" },
      deletedAt: null,
    },
  },
);

export default mongoose.model("Posts", PostSchema);
