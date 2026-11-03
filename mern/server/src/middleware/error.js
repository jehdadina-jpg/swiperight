import { ZodError } from "zod";
import mongoose from "mongoose";

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Wrap async route handlers so a rejected promise reaches the error middleware
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Parse req data with a zod schema; failures become a 400 with per-field messages
export function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const where = first.path.length ? `${first.path.join(".")}: ` : "";
    throw new HttpError(400, `${where}${first.message}`, result.error.flatten().fieldErrors);
  }
  return result.data;
}

export const validId = (id) => mongoose.isValidObjectId(id);

export function notFound(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, details: err.details });
  if (err instanceof ZodError) return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid input" });
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ error: Object.values(err.errors)[0]?.message ?? "Validation failed" });
  }
  if (err?.code === 11000) return res.status(409).json({ error: "That record already exists" });
  if (err?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File is larger than the 10 MB limit" });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ error: "Request body is not valid JSON" });
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side" });
}
