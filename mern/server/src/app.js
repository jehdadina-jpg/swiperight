import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/auth.js";
import cardRoutes from "./routes/cards.js";
import statementRoutes from "./routes/statements.js";
import expenseRoutes from "./routes/expenses.js";
import savedRoutes from "./routes/saved.js";
import recommendationRoutes from "./routes/recommendations.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: config.clientOrigin }));
  app.use(express.json({ limit: "100kb" }));
  if (config.env !== "test") app.use(morgan("dev"));

  app.get("/api/health", (_req, res) =>
    res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
  );

  // Brute-force guard on sign-in / sign-up; skipped under test so suites can register freely
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.env === "test",
  });
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/cards", cardRoutes);
  app.use("/api/statements", statementRoutes);
  app.use("/api/expenses", expenseRoutes);
  app.use("/api/saved", savedRoutes);
  app.use("/api/recommendations", recommendationRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
