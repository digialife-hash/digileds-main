import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      required: true,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

counterSchema.index({ tenantId: 1, id: 1 }, { unique: true });

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
