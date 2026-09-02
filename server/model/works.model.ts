import mongoose, { Schema } from "mongoose";

const LayerSchema = new Schema(
  {
    id: { type: String, required: true },
    src: { type: String, required: true }, // image URL
    x: Number,
    y: Number,
    scaleX: Number,
    scaleY: Number,
    rotation: Number,
    grayscale: Boolean,
    name: String,
  },
  { _id: false }
);

const DesignSchema = new Schema(
  {
    stage: {
      scale: { type: Number, required: true },
      position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      },
    },

    layers: {
      type: [LayerSchema],
      default: [],
    },
  },
  { _id: false }
);

const WorksSchema = new Schema(
  {
    artist: { type: String, required: true },
    screenShot: { type: String, required: true },
    design: { type: DesignSchema, required: true },
  }
);

export default mongoose.model("Works", WorksSchema);
