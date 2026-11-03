import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";

const savedCardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    note: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);
savedCardSchema.index({ user: 1, card: 1 }, { unique: true });
cleanJson(savedCardSchema);

export const SavedCard = mongoose.model("SavedCard", savedCardSchema);
