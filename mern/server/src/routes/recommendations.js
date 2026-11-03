import { Router } from "express";
import { z } from "zod";
import { Statement } from "../models/Statement.js";
import { Recommendation } from "../models/Recommendation.js";
import { CATEGORIES } from "../services/categorizer.js";
import { generateReasoning, recommendCards } from "../services/recommendationEngine.js";
import { expenseTotals } from "./expenses.js";
import { HttpError, parse, validId, wrap } from "../middleware/error.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

const requestSchema = z
  .object({
    statementId: z.string().optional(),
    manualCategoryTotals: z.record(z.number().min(0)).optional(),
    useMyExpenses: z.boolean().optional(),
    userIncome: z.number().int().min(0).optional(),
    userCibil: z.number().int().min(300).max(900).optional(),
    excludedIssuers: z.array(z.string()).optional(),
    maxAnnualFee: z.number().min(0).optional(),
    requireLoungeAccess: z.boolean().default(false),
    topN: z.number().int().min(1).max(10).default(5),
  })
  .refine((v) => [v.statementId, v.manualCategoryTotals, v.useMyExpenses].filter(Boolean).length === 1, {
    message: "Provide exactly one of statementId, manualCategoryTotals or useMyExpenses",
  });

// Resolve the request into annual spend per category
async function resolveTotals(req, input) {
  if (input.statementId) {
    if (!validId(input.statementId)) throw new HttpError(404, "Statement not found");
    const statement = await Statement.findById(input.statementId);
    if (!statement) throw new HttpError(404, "Statement not found");
    // A statement covers a few weeks or months - scale it up to a full year
    const factor = 365 / Math.max(statement.periodDays, 1);
    const totals = Object.fromEntries(statement.categoryTotals.map((c) => [c.category, c.totalAmount * factor]));
    if (!Object.keys(totals).length) throw new HttpError(400, "No spending categories found");
    return totals;
  }
  if (input.useMyExpenses) {
    if (!req.user) throw new HttpError(401, "Sign in to use your saved expenses");
    const rows = await expenseTotals(req.user._id);
    if (!rows.length) throw new HttpError(400, "Add some expenses first - none found in the last 12 months");
    return Object.fromEntries(rows.map((r) => [r.category, r.total]));
  }
  const totals = Object.fromEntries(
    Object.entries(input.manualCategoryTotals).filter(([c, amount]) => CATEGORIES.includes(c) && amount > 0)
  );
  if (!Object.keys(totals).length) {
    throw new HttpError(400, "Enter a positive amount in at least one spending category");
  }
  return totals;
}

router.post(
  "/",
  optionalAuth,
  wrap(async (req, res) => {
    const input = parse(requestSchema, req.body);
    const totals = await resolveTotals(req, input);

    let ranked;
    try {
      ranked = await recommendCards(totals, input);
    } catch (e) {
      throw new HttpError(400, e.message);
    }

    const recommendations = ranked.map(({ card, details, score }, i) => {
      const reasoning = generateReasoning(card, totals, details);
      return { rank: i + 1, card: { ...card, id: String(card._id), _id: undefined, __v: undefined }, calculationDetails: details, reasoning, confidenceScore: score / 100 };
    });

    // Only the top pick is stored, as the history shown on the dashboard
    const top = ranked[0];
    const saved = await Recommendation.create({
      user: req.user?._id ?? null,
      card: top.card._id,
      categoryTotals: totals,
      yearlySpend: top.details.yearlySpend,
      totalRewards: top.details.totalRewards,
      effectiveRewardRate: top.details.effectiveRewardRate,
      netAnnualBenefit: top.details.netAnnualBenefit,
      reasoning: recommendations[0].reasoning,
      score: top.score,
    });
    recommendations[0].recommendationId = String(saved._id);

    res.json({ recommendations, categoryTotalsUsed: totals });
  })
);

router.get(
  "/history",
  requireAuth,
  wrap(async (req, res) => {
    const rows = await Recommendation.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10).populate("card");
    res.json(
      rows
        .filter((r) => r.card)
        .map((r) => ({
          id: String(r._id),
          cardName: r.card.name,
          cardIssuer: r.card.issuer,
          netAnnualBenefit: r.netAnnualBenefit,
          createdAt: r.createdAt,
        }))
    );
  })
);

export default router;
