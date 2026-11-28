import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/User.js";
import Donor, { BLOOD_GROUPS } from "../models/Donor.js";
import { signToken } from "../utils/token.js";
import { normalizeCity } from "../utils/normalizeCity.js";
import { httpError } from "../utils/httpError.js";

// bcrypt cost factor: each +1 doubles hashing time. 10 is the common default.
const BCRYPT_ROUNDS = 10;

// ---- zod schemas (unknown fields are stripped, so a client cannot inject extra fields) ----

const common = {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  // bcrypt only uses the first 72 bytes of a password, so cap the length there.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
};

// Only donor and requester can self-register (D-006). Any other role, including
// "admin", fails validation.
const registerSchema = z.discriminatedUnion(
  "role",
  [
    z.object({ ...common, role: z.literal("requester") }),
    z.object({
      ...common,
      role: z.literal("donor"),
      bloodGroup: z.enum(BLOOD_GROUPS, "Choose a valid blood group"),
      city: z.string("City is required").trim().min(1, "City is required").max(100),
      available: z.boolean().optional(),
    }),
  ],
  { error: "Role must be donor or requester" },
);

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Password is required"),
});

// Runs a schema and turns a failure into a 400 with one readable message.
function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const field = issue.path.join(".");
  throw httpError(400, field ? `${field}: ${issue.message}` : issue.message);
}

// ---- handlers ----

// POST /api/auth/register
export async function register(req, res) {
  const data = parse(registerSchema, req.body);

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  let user;
  try {
    user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      role: data.role,
    });
  } catch (err) {
    // 11000 = MongoDB duplicate key (unique email index). This also covers two
    // simultaneous registrations that both passed any "email exists?" check.
    if (err.code === 11000) throw httpError(409, "Email is already registered");
    throw err;
  }

  if (data.role === "donor") {
    try {
      await Donor.create({
        user: user._id,
        bloodGroup: data.bloodGroup,
        city: data.city,
        cityNormalized: normalizeCity(data.city),
        available: data.available ?? true,
      });
    } catch (err) {
      // No multi-document transaction (kept simple): undo the user so a failed
      // donor registration never leaves a donor account without a donor profile.
      await User.deleteOne({ _id: user._id });
      throw err;
    }
  }

  res.status(201).json({ data: { token: signToken(user), user } });
}

// POST /api/auth/login
export async function login(req, res) {
  const { email, password } = parse(loginSchema, req.body);

  // passwordHash is select:false, so it must be requested explicitly here.
  const user = await User.findOne({ email }).select("+passwordHash");

  // Same message for "no such email" and "wrong password" so the API does not
  // reveal which emails are registered.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw httpError(401, "Invalid email or password");

  res.json({ data: { token: signToken(user), user } });
}

// GET /api/auth/me   (requires authenticate)
export async function me(req, res) {
  const donor = req.user.role === "donor" ? await Donor.findOne({ user: req.user._id }) : null;
  res.json({ data: { user: req.user, donor } });
}
