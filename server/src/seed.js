import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

// Admin credentials come from .env (never hardcoded in the repo).
const envSchema = z.object({
  ADMIN_NAME: z.string("ADMIN_NAME is not set").trim().min(2, "ADMIN_NAME must be at least 2 characters"),
  ADMIN_EMAIL: z
    .string("ADMIN_EMAIL is not set")
    .trim()
    .toLowerCase()
    .pipe(z.email("ADMIN_EMAIL must be a valid email")),
  ADMIN_PASSWORD: z
    .string("ADMIN_PASSWORD is not set")
    .min(8, "ADMIN_PASSWORD must be at least 8 characters")
    .max(72, "ADMIN_PASSWORD must be at most 72 characters"),
});

async function seedAdmin() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const { ADMIN_NAME: name, ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = parsed.data;

  // Never turn an existing donor/requester into an admin by seeding their email.
  const existing = await User.findOne({ email });
  if (existing && existing.role !== "admin") {
    throw new Error(`${email} already exists as a ${existing.role}; use a different ADMIN_EMAIL`);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert by email (D-016): creates the admin, or updates it on a re-run
  // (re-running with a new ADMIN_PASSWORD rotates the password).
  await User.findOneAndUpdate(
    { email },
    { $set: { name, passwordHash, role: "admin" } },
    { upsert: true },
  );

  console.log(`${existing ? "Updated" : "Created"} admin: ${email}`);
}

try {
  await connectDB(process.env.MONGO_URI);
  await seedAdmin();
} catch (err) {
  console.error(`Seed failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
