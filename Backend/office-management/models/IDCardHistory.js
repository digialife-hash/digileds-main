import mongoose from "mongoose";

const idCardHistorySchema = new mongoose.Schema(
  {
    idCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IDCard",
      required: [true, "ID Card ID is required"],
      index: true,
    },
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReferralPartner",
      required: false,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

idCardHistorySchema.index({ idCardId: 1, createdAt: -1 });

const IDCardHistory = mongoose.model("IDCardHistory", idCardHistorySchema);
export default IDCardHistory;
