import { z } from "zod";
import Donor, { BLOOD_GROUPS } from "../models/Donor.js";
import { normalizeCity } from "../utils/normalizeCity.js";
import { httpError } from "../utils/httpError.js";

// ---- zod schemas (unknown fields are stripped, so a donor cannot change bloodGroup, verified, etc.) ----

const PHONE_REGEX = /^\+?[0-9 ()-]{7,20}$/;

// PATCH /donors/me: every field is optional, but at least one must be sent.
const updateSchema = z
  .object({
    phone: z.string("Phone must be text").trim().regex(PHONE_REGEX, "Enter a valid phone number").optional(),
    city: z.string("City must be text").trim().min(1, "City is required").max(100).optional(),
    available: z.boolean("Available must be true or false").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

// GET /donors/search: both filters are required.
const searchSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS, "Choose a valid blood group"),
  city: z.string("City is required").trim().min(1, "City is required").max(100),
});

// Runs a schema and turns a failure into a 400 with one readable message.
function parse(schema, input) {
  const result = schema.safeParse(input ?? {});
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  const field = issue.path.join(".");
  throw httpError(400, field ? `${field}: ${issue.message}` : issue.message);
}

// A user with role "donor" always has a Donor document (created at registration).
async function loadDonor(user) {
  const donor = await Donor.findOne({ user: user._id });
  if (!donor) throw httpError(404, "Donor profile not found");
  return donor;
}

// ---- handlers ----

// GET /api/donors/me   (donor only)
export async function getMe(req, res) {
  const donor = await loadDonor(req.user);
  res.json({ data: { user: req.user, donor } });
}

// PATCH /api/donors/me   (donor only)
// phone -> User (D-014); city and available -> Donor. cityNormalized is
// recomputed whenever city changes so matching and search keep working.
export async function updateMe(req, res) {
  const data = parse(updateSchema, req.body);
  const donor = await loadDonor(req.user);

  if (data.phone !== undefined) {
    req.user.phone = data.phone;
    await req.user.save();
  }

  if (data.city !== undefined) {
    donor.city = data.city;
    donor.cityNormalized = normalizeCity(data.city);
  }
  if (data.available !== undefined) donor.available = data.available;
  await donor.save();

  res.json({ data: { user: req.user, donor } });
}

// GET /api/donors/search?bloodGroup=&city=   (requester, admin)
// Only verified + available donors (D-007). Returns name, bloodGroup, city and
// nothing else (D-010): never email, phone or ids.
export async function search(req, res) {
  const { bloodGroup, city } = parse(searchSchema, req.query);

  const donors = await Donor.find({
    bloodGroup,
    cityNormalized: normalizeCity(city),
    available: true,
    verified: true,
  })
    .populate({ path: "user", select: "name" }) // load only the name from User
    .lean();

  const results = donors
    .filter((d) => d.user) // skip a donor whose user document no longer exists
    .map((d) => ({ name: d.user.name, bloodGroup: d.bloodGroup, city: d.city }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({ data: results });
}
