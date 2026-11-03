import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";

const transactionSchema = new mongoose.Schema({
  statement: { type: mongoose.Schema.Types.ObjectId, ref: "Statement", required: true, index: true },
  date: { type: Date, required: true },
  merchant: { type: String, required: true },
  normalizedMerchant: String,
  amount: { type: Number, required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  category: { type: String, index: true },
  confidence: Number,
});
cleanJson(transactionSchema);

export const Transaction = mongoose.model("Transaction", transactionSchema);
