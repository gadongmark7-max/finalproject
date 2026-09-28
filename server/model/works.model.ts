import mongoose, { Schema } from "mongoose";

const LayerSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: ["image", "text"], default: "image" },
    src: {
      type: String,
      required: function (this: { type?: string }) {
        return this.type !== "text";
      },
    }, 
    x: Number,
    y: Number,
    scaleX: Number,
    scaleY: Number,
    rotation: Number,
    grayscale: Boolean,
    name: String,
    text: { type: String, maxlength: 500 },
    fontFamily: { type: String, maxlength: 100 },
    fontSize: { type: Number, min: 1, max: 1000 },
    fill: { type: String, maxlength: 32 },
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
