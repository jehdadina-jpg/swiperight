import { Router } from "express";
import { z } from "zod";
import { Expense } from "../models/Expense.js";
import { CATEGORIES } from "../services/categorizer.js";
import { HttpError, parse, validId, wrap } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const body = z.object({
  merchant: z.string().trim().min(1, "Merchant is required").max(120),
  amount: z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be greater than zero"),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: "Pick one of the spending categories" }) }),
  date: z.coerce.date().optional(),
  note: z.string().trim().max(300).optional(),
});

const listQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

// The trailing 12 months, per category - the figures the recommender can score against
export async function expenseTotals(userId, now = new Date()) {
  const since = new Date(now);
  since.setFullYear(since.getFullYear() - 1);
  const rows = await Expense.aggregate([
    { $match: { user: userId, date: { $gte: since, $lte: now } } },
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  return rows.map((r) => ({ category: r._id, total: Math.round(r.total * 100) / 100, count: r.count }));
}

router.post(
  "/",
  wrap(async (req, res) => {
    const data = parse(body, req.body);
    res.status(201).json(await Expense.create({ ...data, user: req.user._id }));
  })
);

router.get(
  "/summary",
  wrap(async (req, res) => {
    const categories = await expenseTotals(req.user._id);
    res.json({ categories, total: categories.reduce((s, c) => s + c.total, 0) });
  })
);

router.get(
  "/",
  wrap(async (req, res) => {
    const q = parse(listQuery, req.query);
    const filter = { user: req.user._id };
    if (q.category) filter.category = q.category;
    if (q.from || q.to) filter.date = { ...(q.from && { $gte: q.from }), ...(q.to && { $lte: q.to }) };
    res.json(await Expense.find(filter).sort({ date: -1, _id: -1 }).limit(q.limit));
  })
);

router.put(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Expense not found");
    const data = parse(body.partial(), req.body);
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, data, {
      new: true,
      runValidators: true,
    });
    if (!expense) throw new HttpError(404, "Expense not found");
    res.json(expense);
  })
);

router.delete(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Expense not found");
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) throw new HttpError(404, "Expense not found");
    res.status(204).end();
  })
);

export default router;
