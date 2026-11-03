import mongoose from "mongoose";
import { cleanJson } from "./plugins.js";

const { Mixed } = mongoose.Schema.Types;

const cardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    issuer: { type: String, required: true, trim: true, index: true },
    network: { type: String, required: true, enum: ["Visa", "Mastercard", "RuPay", "Amex", "Diners"] },
    joiningFee: { type: Number, default: 0, min: 0 },
    annualFee: { type: Number, default: 0, min: 0 },
    rewardRate: { type: Number, default: 0, min: 0 },
    rewardCaps: { type: Mixed, default: {} },
    fuelBenefits: { type: Mixed, default: {} },
    diningBenefits: { type: Mixed, default: {} },
    travelBenefits: { type: Mixed, default: {} },
    shoppingBenefits: { type: Mixed, default: {} },
    otherBenefits: { type: Mixed, default: {} },
    minIncome: { type: Number, default: null },
    minCibil: { type: Number, default: null },
    loungeAccess: { type: Boolean, default: false },
    milestones: { type: Mixed, default: {} },
    annualWaiverCondition: { type: String, default: "" },
    redemptionRatio: { type: Number, default: 1 },
    tags: { type: [String], default: [] },
    highlight: { type: String, default: "" },
    churnRisk: { type: String, enum: ["low", "medium", "high"], default: "low" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
cardSchema.index({ name: "text", issuer: "text" });
cleanJson(cardSchema);

export const Card = mongoose.model("Card", cardSchema);
