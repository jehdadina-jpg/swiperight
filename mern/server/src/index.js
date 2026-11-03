import mongoose from "mongoose";
import { config } from "./config.js";
import { createApp } from "./app.js";
import { seedCards } from "./services/seed.js";

export async function start(mongoUri = config.mongoUri) {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  const seeded = await seedCards();
  if (seeded) console.log(`Seeded ${seeded} credit cards`);

  const app = createApp();
  return new Promise((resolve) => {
    const server = app.listen(config.port, () => {
      console.log(`SwipeRight API listening on http://localhost:${config.port}`);
      resolve(server);
    });
  });
}

// Run directly (node src/index.js) rather than imported by dev-memory.js
if (process.argv[1]?.endsWith("index.js")) {
  start().catch((err) => {
    console.error(`Could not start: ${err.message}`);
    console.error("Is MongoDB running? Set MONGODB_URI in server/.env, or use `npm run dev:mem`.");
    process.exit(1);
  });
}
