import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";
import { httpError } from "../utils/httpError.js";

// Reads "Authorization: Bearer <token>", verifies it, loads the user from the DB
// and puts it on req.user. Loading the user each time means a deleted user's old
// token stops working. Express 5 forwards errors thrown in async functions to
// the error handler, so no try/catch wrapper is needed.
export async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw httpError(401, "Authentication required");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw httpError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw httpError(401, "Invalid or expired token");

  req.user = user;
  next();
}

// Use after authenticate: requireRole("admin"), requireRole("requester", "admin").
// 401 = not logged in; 403 = logged in but not allowed.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw httpError(403, "You do not have permission to do this");
    }
    next();
  };
}
