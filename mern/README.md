# SwipeRight (MERN)

Credit card recommendations for Indian spenders. Feed it a bank statement, a set of slider estimates, or expenses you log by hand, and it ranks 64 real cards by what each would actually earn you net of fees.

This is the MongoDB / Express / React / Node edition. The FastAPI + Next.js prototype is still in `../server` and `../client`.

## Stack

| Layer | Tech |
|---|---|
| Database | MongoDB, Mongoose 8 |
| API | Node 18+, Express 4, zod, JWT, helmet, express-rate-limit |
| Statement parsing | `csv-parse`, `pdf-parse`, multer (memory storage) |
| Client | React 18, Vite 5, react-router 6, Zustand, Tailwind, Framer Motion, Recharts |
| Tests | `node:test`, supertest, mongodb-memory-server |

## Run it

Needs Node 18+. Two terminals.

```bash
# API (port 8000)
cd server
npm install
cp .env.example .env        # set MONGODB_URI if you have Mongo/Atlas
npm run dev                 # or: npm run dev:mem  (throwaway in-memory MongoDB, no install)

# Client (port 5173, proxies /api to the API)
cd client
npm install
npm run dev
```

Open http://localhost:5173. The 64-card catalogue seeds itself on first start.

`npm run dev:mem` downloads a MongoDB binary (about 600 MB) the first time and keeps data only until you stop it. Use a real `MONGODB_URI` for anything you want to keep.

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | none | Create account, get a JWT |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/cards` | none | Search, filter, sort the catalogue |
| GET | `/api/cards/issuers` | none | Issuer names for the bank-exclusion filter |
| GET | `/api/cards/:id` | none | One card |
| POST / PUT / DELETE | `/api/cards`, `/api/cards/:id` | admin | Maintain the catalogue (delete is a soft delete) |
| POST | `/api/statements` | optional | Upload a PDF/CSV; returns categorised totals |
| GET / DELETE | `/api/statements`, `/api/statements/:id` | user | History, remove |
| POST / GET / PUT / DELETE | `/api/expenses` | user | Manual expense CRUD, plus `GET /api/expenses/summary` |
| POST / GET / PUT / DELETE | `/api/saved` | user | Shortlist with notes |
| POST | `/api/recommendations` | optional | Rank cards for a statement, slider totals, or logged expenses |
| GET | `/api/recommendations/history` | user | Past top picks |

Errors are `{ "error": "message" }` with a sensible status (400 validation, 401, 403, 404, 409, 413, 422).

## How a card is scored

For each category, reward = the better of the base rate and the card's category multiplier or cashback, then capped: an explicit category cap, else the card's monthly cap x 12, else a default of ₹2,000/month on top of base for any boosted category. Milestone bonuses are added once. Net benefit is rewards minus annual fee.

The ranking score is 40% net benefit (as a percent of yearly spend), 30% category fit, 20% premium features, 10% low fee. Statements are scaled to a 12-month figure from the span of their dates.

## Tests

```bash
cd server && npm test
```

Unit tests cover the categoriser, date and CSV/PDF-text parsing, and the reward math. API tests run the real Express app against an in-memory MongoDB: auth, expense and shortlist CRUD with ownership checks, filtering and sorting, preference filters, statement upload and validation errors.

## Layout

```
server/src
  models/      Mongoose schemas
  routes/      auth, cards, statements, expenses, saved, recommendations
  services/    categorizer, statementParser, recommendationEngine, seed
  middleware/  auth (JWT), error handling, zod parse helper
  data/cards.json
client/src
  pages/       Landing, Dashboard, Cards, Compare, Saved, Quiz, Expenses, Login, Register
  components/  card visual, swipe deck, upload zone, nav, ui/
  lib/         api client, auth + saved-cards stores
```
