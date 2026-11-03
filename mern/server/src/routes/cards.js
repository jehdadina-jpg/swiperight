import { Router } from "express";
import { z } from "zod";
import { Card } from "../models/Card.js";
import { HttpError, parse, validId, wrap } from "../middleware/error.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SORTABLE = { rewardRate: "rewardRate", annualFee: "annualFee", name: "name" };

const listQuery = z.object({
  search: z.string().trim().max(60).optional(),
  issuer: z.string().trim().optional(),
  network: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  maxAnnualFee: z.coerce.number().min(0).optional(),
  loungeAccess: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["rewardRate", "annualFee", "name"]).default("rewardRate"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

const cardBody = z.object({
  name: z.string().trim().min(2).max(100),
  issuer: z.string().trim().min(2).max(60),
  network: z.enum(["Visa", "Mastercard", "RuPay", "Amex", "Diners"]),
  joiningFee: z.number().min(0).default(0),
  annualFee: z.number().min(0).default(0),
  rewardRate: z.number().min(0).max(100),
  tags: z.array(z.string().trim().toLowerCase()).default([]),
  highlight: z.string().trim().max(300).default(""),
  loungeAccess: z.boolean().default(false),
  minIncome: z.number().min(0).nullable().default(null),
  minCibil: z.number().min(300).max(900).nullable().default(null),
  churnRisk: z.enum(["low", "medium", "high"]).default("low"),
});

router.get(
  "/issuers",
  wrap(async (_req, res) => {
    res.json((await Card.distinct("issuer", { isActive: true })).sort());
  })
);

router.get(
  "/",
  wrap(async (req, res) => {
    const q = parse(listQuery, req.query);
    const filter = { isActive: true };
    if (q.search) {
      const re = new RegExp(escapeRegex(q.search), "i");
      filter.$or = [{ name: re }, { issuer: re }];
    }
    if (q.issuer) filter.issuer = new RegExp(`^${escapeRegex(q.issuer)}$`, "i");
    if (q.network) filter.network = new RegExp(`^${escapeRegex(q.network)}$`, "i");
    if (q.tag) filter.tags = q.tag.toLowerCase();
    if (q.maxAnnualFee !== undefined) filter.annualFee = { $lte: q.maxAnnualFee };
    if (q.loungeAccess) filter.loungeAccess = q.loungeAccess === "true";

    const cards = await Card.find(filter)
      .sort({ [SORTABLE[q.sortBy]]: q.sortDir === "asc" ? 1 : -1, _id: 1 })
      .skip(q.offset)
      .limit(q.limit);
    res.json(cards);
  })
);

router.get(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Card not found");
    const card = await Card.findById(req.params.id);
    if (!card) throw new HttpError(404, "Card not found");
    res.json(card);
  })
);

// Catalogue maintenance - admin only
router.post(
  "/",
  requireAuth,
  requireAdmin,
  wrap(async (req, res) => {
    res.status(201).json(await Card.create(parse(cardBody, req.body)));
  })
);

router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Card not found");
    const card = await Card.findByIdAndUpdate(req.params.id, parse(cardBody.partial(), req.body), {
      new: true,
      runValidators: true,
    });
    if (!card) throw new HttpError(404, "Card not found");
    res.json(card);
  })
);

// Soft delete keeps old recommendations and shortlists readable
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Card not found");
    const card = await Card.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!card) throw new HttpError(404, "Card not found");
    res.status(204).end();
  })
);

export default router;
