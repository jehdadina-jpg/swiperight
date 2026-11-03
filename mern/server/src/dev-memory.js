// Zero-install dev mode: boots a throwaway in-memory MongoDB so the API runs
// without a local mongod or an Atlas account. Data is lost when the process exits.
import { MongoMemoryServer } from "mongodb-memory-server";
import { start } from "./index.js";

const mongod = await MongoMemoryServer.create();
console.log(`In-memory MongoDB started at ${mongod.getUri()}`);
await start(mongod.getUri("swiperight"));

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    await mongod.stop();
    process.exit(0);
  });
}
