import mongoose from "mongoose";

const commissionAdjustmentSchema = new mongoose.Schema(
  {
    commissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commission",
      required: [true, "Commission ID is required"],
      index: true,
    },
    adjustmentType: {
      type: String,
      enum: ["Increase", "Reduce", "Bonus", "Penalty", "Correction"],
      required: [true, "Adjustment type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Adjustment amount is required"],
    },
    reason: {
      type: String,
      required: [true, "Adjustment reason/remarks is required"],
      trim: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
  },
  {
    timestamps: true,
  }
);

commissionAdjustmentSchema.index({ commissionId: 1, createdAt: -1 });

const CommissionAdjustment = mongoose.model(
  "CommissionAdjustment",
  commissionAdjustmentSchema
);

export default CommissionAdjustment;
