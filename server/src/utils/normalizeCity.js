// Single definition of city normalization (SPEC.md, Matching Logic).
// Used on write (Donor, Request) and when searching/matching by city.
export function normalizeCity(city) {
  return String(city).trim().toLowerCase().replace(/\s+/g, " ");
}
