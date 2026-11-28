import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
  channel: { type: String, enum: ["email", "sms"], required: true },
  status: { type: String, enum: ["sent", "failed"], required: true },
  previewUrl: { type: String },
  error: { type: String },
  sentAt: { type: Date, default: Date.now },
});

// Lets a request's notification history be fetched quickly.
notificationSchema.index({ request: 1 });

export default mongoose.model("Notification", notificationSchema);
