import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, trim: true, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);
cleanJson(userSchema);

export const User = mongoose.model("User", userSchema);
