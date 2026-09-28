import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    department: { type: String, default: "Team", trim: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    quote: { type: String, default: "" },
    bio: { type: String, default: "" },
    experience: { type: String, default: "" },
    location: { type: String, default: "" },
    linkedin: { type: String, default: "#" },
    twitter: { type: String, default: "#" },
    email: { type: String, default: "" },
    group: { type: String, enum: ["leadership", "team"], default: "team" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { collection: "team_members", timestamps: true },
);

export default mongoose.models.TeamMember ||
  mongoose.model("TeamMember", teamMemberSchema);
