import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { config } from "../config.js";
import { Statement } from "../models/Statement.js";
import { Transaction } from "../models/Transaction.js";
import { HttpError, validId, wrap } from "../middleware/error.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { parseStatement, periodDaysOf } from "../services/statementParser.js";
import { categorizeBatch, categoryTotals, detectRecurring } from "../services/categorizer.js";

const router = Router();

// Files are parsed straight from memory and never written to disk, so a statement
// is discarded as soon as its transactions have been extracted.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.maxUploadBytes } });

function summary(statement) {
  return {
    statementId: String(statement._id),
    fileName: statement.fileName,
    status: statement.status,
    transactionCount: statement.transactionCount,
    totalSpending: statement.totalSpending,
    periodDays: statement.periodDays,
    categoryTotals: statement.categoryTotals,
  };
}

router.post(
  "/",
  optionalAuth,
  upload.single("file"),
  wrap(async (req, res) => {
    if (!req.file) throw new HttpError(400, "Attach a PDF or CSV file in the 'file' field");
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (![".pdf", ".csv"].includes(ext)) throw new HttpError(400, "Only PDF and CSV files are supported");

    let parsed;
    try {
      parsed = await parseStatement(req.file.buffer, ext.slice(1));
    } catch {
      parsed = [];
    }
    if (!parsed.length) {
      throw new HttpError(
        422,
        "Couldn't find any transactions in this statement. Try a CSV export, or a PDF with a clear transaction table."
      );
    }

    const categorized = detectRecurring(categorizeBatch(parsed));
    const { list, spending } = categoryTotals(categorized);
    const statement = await Statement.create({
      user: req.user?._id ?? null,
      fileName: req.file.originalname,
      fileType: ext.slice(1).toUpperCase(),
      periodDays: periodDaysOf(categorized),
      transactionCount: categorized.length,
      totalSpending: spending,
      categoryTotals: list,
    });
    await Transaction.insertMany(categorized.map((t) => ({ ...t, statement: statement._id })));
    res.status(201).json(summary(statement));
  })
);

router.get(
  "/",
  requireAuth,
  wrap(async (req, res) => {
    const rows = await Statement.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(rows.map((s) => ({ ...summary(s), createdAt: s.createdAt })));
  })
);

router.get(
  "/:id",
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Statement not found");
    const statement = await Statement.findById(req.params.id);
    if (!statement) throw new HttpError(404, "Statement not found");
    const transactions = await Transaction.find({ statement: statement._id }).sort({ date: -1 }).limit(500);
    res.json({ ...summary(statement), transactions });
  })
);

router.delete(
  "/:id",
  requireAuth,
  wrap(async (req, res) => {
    if (!validId(req.params.id)) throw new HttpError(404, "Statement not found");
    const statement = await Statement.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!statement) throw new HttpError(404, "Statement not found");
    await Transaction.deleteMany({ statement: statement._id });
    res.status(204).end();
  })
);

export default router;
