import { Card } from "../models/Card.js";

// Spending category -> the card tag that signals a good fit for it
export const CATEGORY_TO_TAG = {
  Dining: "dining",
  Travel: "travel",
  Fuel: "fuel",
  Shopping: "shopping",
  Groceries: "shopping",
  Utilities: "lifestyle",
  Subscriptions: "lifestyle",
  Healthcare: "lifestyle",
  Entertainment: "lifestyle",
  Education: "lifestyle",
  Bills: "cashback",
  Investments: "premium",
  Others: "cashback",
};

// Seed data spells a monthly cap under several keys depending on the issuer page it came from
const REWARD_CAP_KEYS = ["monthly", "cashback_monthly", "monthly_online"];

// Most cards list no cap for their bonus category, but real cards almost never leave a
// 2X-10X multiplier uncapped. Without a ceiling one big slider value earns an unlimited rate,
// so bonus categories without an explicit cap fall back to this monthly figure.
export const DEFAULT_MONTHLY_BONUS_CAP = 2000;

// The catalogue's rewardRate is the issuer's headline figure (10% on Swiggy, 12X on partners...),
// not what the card earns on everything. Ordinary spend is credited at no more than this base
// rate; anything above it has to come from the card's own category benefits.
export const BASE_EARN_CEILING = 2;

const baseRateOf = (card) => Math.min(card.rewardRate, BASE_EARN_CEILING);

const round2 = (n) => Math.round(n * 100) / 100;

// Boosted rates that are tied to named partner merchants (Swiggy, Amazon...) only apply to the
// slice of a category spent there. We don't know the slice, so assume this share of it.
export const PARTNER_SHARE = 0.25;

function benefitReward(base, amount, benefits) {
  const multiplier = benefits.rewardMultiplier ?? benefits.reward_multiplier ?? 1;
  const cashback = benefits.cashback ?? 0;
  const boosted = Math.max(base * multiplier, (amount * cashback) / 100);
  const partnerOnly = Array.isArray(benefits.partners) && benefits.partners.length > 0;
  const share = partnerOnly ? PARTNER_SHARE : 1;
  return {
    reward: boosted > base ? boosted * share + base * (1 - share) : base,
    elevated: multiplier > 1 || cashback > 0,
  };
}

export function categoryReward(card, category, amount) {
  const base = (amount * baseRateOf(card)) / 100;
  let reward = base;
  let elevated = false;

  if (category === "Dining" && card.diningBenefits) {
    ({ reward, elevated } = benefitReward(base, amount, card.diningBenefits));
  } else if (category === "Travel" && card.travelBenefits) {
    ({ reward, elevated } = benefitReward(base, amount, card.travelBenefits));
  } else if ((category === "Shopping" || category === "Groceries") && card.shoppingBenefits) {
    ({ reward, elevated } = benefitReward(base, amount, card.shoppingBenefits));
  } else if (category === "Fuel" && card.fuelBenefits) {
    const cashback = card.fuelBenefits.cashback ?? 0;
    const waiver = card.fuelBenefits.surcharge_waiver ? parseFloat(card.fuelBenefits.surcharge_waiver) / 100 : 0;
    // cashback is a total earn rate so it replaces the base reward; the surcharge waiver
    // is money not paid at all, so it adds on top
    reward = Math.max(base, (amount * cashback) / 100) + amount * (Number.isNaN(waiver) ? 0 : waiver);
    elevated = cashback > 0;
  }

  const caps = card.rewardCaps || {};
  const categoryCap = caps[category.toLowerCase()];
  if (categoryCap) {
    reward = Math.min(reward, categoryCap);
  } else {
    const monthlyCap = REWARD_CAP_KEYS.map((k) => caps[k]).find(Boolean);
    if (monthlyCap) reward = Math.min(reward, monthlyCap * 12);
    else if (elevated) reward = Math.min(reward, base + DEFAULT_MONTHLY_BONUS_CAP * 12);
  }
  return reward;
}

function milestoneBonus(card, yearlySpend) {
  return Object.entries(card.milestones || {}).reduce(
    (sum, [threshold, bonus]) => (yearlySpend >= Number(threshold) ? sum + bonus : sum),
    0
  );
}

// Weights: net benefit 40%, category fit 30%, premium features 20%, low fee 10%.
// Net benefit is taken as a % of yearly spend so it shares the 0-100 scale of the others.
function ruleScore(card, totals, netBenefit, yearlySpend) {
  let score = (yearlySpend > 0 ? (netBenefit / yearlySpend) * 100 : 0) * 0.4;

  let fit = 0;
  for (const [category, amount] of Object.entries(totals)) {
    const tag = CATEGORY_TO_TAG[category] ?? "cashback";
    if (card.tags?.includes(tag)) fit += (amount / yearlySpend) * 100;
  }
  score += fit * 0.3;

  let premium = 0;
  if (card.loungeAccess) premium += 20;
  if (card.otherBenefits?.concierge) premium += 15;
  if (card.otherBenefits?.golf) premium += 10;
  if (card.travelBenefits?.insurance) premium += 10;
  score += premium * 0.2;

  score += Math.max(0, 100 - card.annualFee / 100) * 0.1;
  return Math.max(score, 0);
}

export function scoreCard(card, totals, yearlySpend) {
  const categoryRewards = {};
  let rewards = 0;
  for (const [category, amount] of Object.entries(totals)) {
    const r = categoryReward(card, category, amount);
    categoryRewards[category] = r;
    rewards += r;
  }
  // The earn rate excludes the one-off milestone bonus so it stays a genuine rate
  const effectiveRewardRate = yearlySpend > 0 ? (rewards / yearlySpend) * 100 : 0;
  const bonus = milestoneBonus(card, yearlySpend);
  const totalRewards = rewards + bonus;
  const netAnnualBenefit = totalRewards - card.annualFee;
  const baseRate = baseRateOf(card) / 100;
  const breakevenSpend = baseRate > 0 ? card.annualFee / baseRate : null;
  const score = ruleScore(card, totals, netAnnualBenefit, yearlySpend);

  return {
    score,
    details: {
      yearlySpend,
      totalRewards: round2(totalRewards),
      milestoneBonus: round2(bonus),
      annualFee: card.annualFee,
      netAnnualBenefit: round2(netAnnualBenefit),
      effectiveRewardRate: round2(effectiveRewardRate),
      breakevenSpend: breakevenSpend === null ? null : round2(breakevenSpend),
      categoryRewards: Object.fromEntries(Object.entries(categoryRewards).map(([k, v]) => [k, round2(v)])),
      score: round2(score),
    },
  };
}

export async function recommendCards(totals, prefs = {}) {
  const yearlySpend = Object.values(totals).reduce((a, b) => a + b, 0);
  if (yearlySpend <= 0) throw new Error("Total spending is zero, cannot recommend a card");

  const filter = { isActive: true };
  if (prefs.maxAnnualFee != null) filter.annualFee = { $lte: prefs.maxAnnualFee };
  if (prefs.requireLoungeAccess) filter.loungeAccess = true;
  const and = [];
  if (prefs.userIncome != null) and.push({ $or: [{ minIncome: null }, { minIncome: { $lte: prefs.userIncome } }] });
  if (prefs.userCibil != null) and.push({ $or: [{ minCibil: null }, { minCibil: { $lte: prefs.userCibil } }] });
  if (and.length) filter.$and = and;

  let cards = await Card.find(filter).lean();
  if (prefs.excludedIssuers?.length) {
    const excluded = new Set(prefs.excludedIssuers.map((i) => i.trim().toLowerCase()).filter(Boolean));
    cards = cards.filter((c) => !excluded.has(c.issuer.toLowerCase()));
  }
  if (!cards.length) throw new Error("No eligible cards found for user profile");

  return cards
    .map((card) => ({ card, ...scoreCard(card, totals, yearlySpend) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, prefs.topN ?? 5);
}

export function generateReasoning(card, totals, details) {
  const top = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([c]) => c);
  const parts = [];
  if (top.length) parts.push(`Based on your spending pattern, you primarily spend on ${top.slice(0, 2).join(", ")}.`);

  const perks = [];
  for (const cat of top.slice(0, 2)) {
    if (!card.tags?.includes(CATEGORY_TO_TAG[cat])) continue;
    if (cat === "Dining" && (card.diningBenefits?.reward_multiplier ?? 1) > 1) {
      perks.push(`${card.diningBenefits.reward_multiplier}X rewards on dining`);
    } else if (cat === "Travel" && card.travelBenefits?.lounge_access) {
      perks.push("airport lounge access");
    } else if (cat === "Fuel" && (card.fuelBenefits?.cashback ?? 0) > 0) {
      perks.push(`${card.fuelBenefits.cashback}% fuel cashback`);
    }
  }
  parts.push(
    perks.length
      ? `The ${card.name} offers ${perks.join(" and ")}, matching your needs.`
      : `The ${card.name} provides solid overall value with ${card.rewardRate}% rewards on all spends.`
  );

  if (details.netAnnualBenefit > 0) {
    parts.push(`You'll earn about ₹${Math.round(details.netAnnualBenefit).toLocaleString("en-IN")} net a year (rewards minus fees).`);
  } else if (details.breakevenSpend) {
    parts.push(
      `The ₹${Math.round(card.annualFee).toLocaleString("en-IN")} annual fee breaks even at ₹${Math.round(details.breakevenSpend).toLocaleString("en-IN")} of spend.`
    );
  }
  if (card.loungeAccess) parts.push("Plus, complimentary airport lounge access.");
  return parts.join(" ");
}
