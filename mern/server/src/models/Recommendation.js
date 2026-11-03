import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";

const { Mixed } = mongoose.Schema.Types;

const recommendationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    categoryTotals: { type: Mixed, required: true },
    yearlySpend: Number,
    totalRewards: Number,
    effectiveRewardRate: Number,
    netAnnualBenefit: Number,
    reasoning: String,
    score: Number,
  },
  { timestamps: true }
);
cleanJson(recommendationSchema);

export const Recommendation = mongoose.model("Recommendation", recommendationSchema);
