import { readFile } from "node:fs/promises";
import { Card } from "../models/Card.js";

// cards.json keeps the original snake_case catalogue; map it onto the camelCase schema.
// Benefit sub-documents keep their original keys (reward_multiplier, lounge_access, ...).
function toDoc(c) {
  return {
    name: c.name,
    issuer: c.issuer,
    network: c.network,
    joiningFee: c.joining_fee,
    annualFee: c.annual_fee,
    rewardRate: c.reward_rate,
    rewardCaps: c.reward_caps ?? {},
    fuelBenefits: c.fuel_benefits ?? {},
    diningBenefits: c.dining_benefits ?? {},
    travelBenefits: c.travel_benefits ?? {},
    shoppingBenefits: c.shopping_benefits ?? {},
    otherBenefits: c.other_benefits ?? {},
    minIncome: c.min_income ?? null,
    minCibil: c.min_cibil ?? null,
    loungeAccess: Boolean(c.lounge_access),
    milestones: c.milestones ?? {},
    annualWaiverCondition: c.annual_waiver_condition ?? "",
    redemptionRatio: c.redemption_ratio ?? 1,
    tags: c.tags ?? [],
    highlight: c.highlight ?? "",
    churnRisk: c.churn_risk ?? "low",
  };
}

export async function seedCards() {
  if ((await Card.estimatedDocumentCount()) > 0) return 0;
  const raw = await readFile(new URL("../data/cards.json", import.meta.url), "utf8");
  const docs = JSON.parse(raw).map(toDoc);
  await Card.insertMany(docs);
  return docs.length;
}
