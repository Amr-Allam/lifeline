import mongoose from "mongoose";
import { BLOOD_GROUPS } from "./Donor.js";

export const URGENCIES = ["critical", "urgent", "normal"];
export const REQUEST_STATUSES = ["open", "fulfilled", "cancelled"];

const requestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    unitsNeeded: { type: Number, required: true, min: 1, validate: Number.isInteger },
    city: { type: String, required: true, trim: true },
    cityNormalized: { type: String, required: true },
    hospital: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    urgency: { type: String, enum: URGENCIES, required: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: REQUEST_STATUSES, default: "open" },
    // Unique donors notified (D-013), not the number of Notification records.
    notifiedCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

requestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Request", requestSchema);
