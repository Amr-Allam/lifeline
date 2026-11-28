import mongoose from "mongoose";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const donorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    city: { type: String, required: true, trim: true },
    cityNormalized: { type: String, required: true },
    available: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// Serves matching and search (SPEC.md, Indexes).
donorSchema.index({ bloodGroup: 1, cityNormalized: 1, available: 1, verified: 1 });

export default mongoose.model("Donor", donorSchema);
