import mongoose from "mongoose";
import { config } from "./config.js";
import { Card } from "./models/Card.js";
import { seedCards } from "./services/seed.js";

await mongoose.connect(config.mongoUri);
if (process.argv.includes("--reset")) await Card.deleteMany({});
const n = await seedCards();
console.log(n ? `Seeded ${n} cards` : "Cards already present (use --reset to reseed)");
await mongoose.disconnect();
