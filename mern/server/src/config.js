import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 8000,
  env: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/swiperight",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(","),
  geminiKey: process.env.GEMINI_API_KEY || "",
  maxUploadBytes: 10 * 1024 * 1024,
};

if (config.env === "production" && config.jwtSecret === "dev-only-secret") {
  throw new Error("JWT_SECRET must be set in production");
}
