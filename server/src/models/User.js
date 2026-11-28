import mongoose from "mongoose";

export const ROLES = ["donor", "requester", "admin"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> never loaded unless a query asks with .select("+passwordHash")
    passwordHash: { type: String, required: true, select: false },
    // Phone lives only here (D-014). Format/required-ness is enforced by zod at registration.
    phone: { type: String, trim: true },
    role: { type: String, enum: ROLES, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Safety net: even if passwordHash is loaded, it is stripped from JSON output.
userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
