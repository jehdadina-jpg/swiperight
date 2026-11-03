import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";
import { CATEGORIES } from "../services/categorizer.js";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    merchant: { type: String, required: true, trim: true, maxlength: 120 },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, enum: CATEGORIES },
    note: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);
expenseSchema.index({ user: 1, date: -1 });
cleanJson(expenseSchema);

export const Expense = mongoose.model("Expense", expenseSchema);
