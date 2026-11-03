import { Router } from "express";
import { z } from "zod";
import { SavedCard } from "../models/SavedCard.js";
import { Card } from "../models/Card.js";
import { HttpError, parse, validId, wrap } from "../middleware/error.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const createBody = z.object({
  cardId: z.string().min(1, "cardId is required"),
  note: z.string().trim().max(300).optional(),
});
const updateBody = z.object({ note: z.string().trim().max(300) });

const shape = (row) => ({ id: String(row._id), note: row.note, createdAt: row.createdAt, card: row.card });

router.get(
  "/",
  wrap(async (req, res) => {
    const rows = await SavedCard.find({ user: req.user._id }).sort({ createdAt: -1 }).populate("card");
    res.json(rows.filter((r) => r.card).map(shape));
  })
);

router.post(
  "/",
  wrap(async (req, res) => {
    const { cardId, note } = parse(createBody, req.body);
    if (!validId(cardId) || !(await Card.exists({ _id: cardId }))) throw new HttpError(404, "Card not found");
    // Saving the same card twice is a no-op that returns the existing row
    const row = await SavedCard.findOneAndUpdate(
      { user: req.user._id, card: cardId },
      { $setOnInsert: { user: req.user._id, card: cardId, note: note ?? "" } },
      { upsert: true, new: true }
    ).populate("card");
    res.status(201).json(shape(row));
  })
);

router.put(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Saved card not found");
    const { note } = parse(updateBody, req.body);
    const row = await SavedCard.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { note }, { new: true }).populate("card");
    if (!row) throw new HttpError(404, "Saved card not found");
    res.json(shape(row));
  })
);

router.delete(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Saved card not found");
    const row = await SavedCard.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!row) throw new HttpError(404, "Saved card not found");
    res.status(204).end();
  })
);

export default router;
