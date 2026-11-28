import jwt from "jsonwebtoken";

// Token payload: { sub: <userId>, role }. Signed with JWT_SECRET (env only).
export function signToken(user) {
  return jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user._id),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Throws if the token is missing, tampered with, or expired.
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
