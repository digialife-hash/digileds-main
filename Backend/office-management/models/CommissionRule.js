import mongoose from "mongoose";

const commissionRuleSchema = new mongoose.Schema(
  {
    ruleName: {
      type: String,
      required: [true, "Rule name is required"],
      trim: true,
    },
    commissionType: {
      type: String,
      enum: [
        "Percentage Based",
        "Fixed Amount",
        "Manual Commission",
        "Project Based",
        "Monthly Commission",
      ],
      required: true,
      default: "Percentage Based",
    },
    percentage: {
      type: Number,
      default: 10,
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100%"],
    },
    fixedAmount: {
      type: Number,
      default: 5000,
      min: [0, "Fixed amount cannot be negative"],
    },
    minBudgetThreshold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

commissionRuleSchema.index({ isActive: 1 });

const CommissionRule = mongoose.model("CommissionRule", commissionRuleSchema);
export default CommissionRule;
