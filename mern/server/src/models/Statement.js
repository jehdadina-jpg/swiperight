import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";

const statementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["PDF", "CSV"], required: true },
    status: { type: String, enum: ["completed", "failed"], default: "completed" },
    periodDays: { type: Number, default: 365 },
    transactionCount: { type: Number, default: 0 },
    totalSpending: { type: Number, default: 0 },
    categoryTotals: [
      {
        _id: false,
        category: String,
        totalAmount: Number,
        transactionCount: Number,
        percentage: Number,
      },
    ],
  },
  { timestamps: true }
);
cleanJson(statementSchema);

export const Statement = mongoose.model("Statement", statementSchema);
