import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";
import { HttpError } from "./error.js";

export function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

async function userFromRequest(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret);
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

// Attaches req.user when a valid token is sent; guests continue without one
export async function optionalAuth(req, _res, next) {
  req.user = await userFromRequest(req);
  next();
}

export async function requireAuth(req, _res, next) {
  req.user = await userFromRequest(req);
  if (!req.user) return next(new HttpError(401, "Please sign in to continue"));
  next();
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") return next(new HttpError(403, "Admin access required"));
  next();
}
