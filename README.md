# SwipeRight

Credit card recommendation tool for the Indian market. Give it a bank statement or a manual spending estimate and it ranks the top 5 cards from its catalog against that spending pattern, with the reasoning behind each rank.

The production frontend is the Next.js app in `client/`. `legacy/` holds the original static HTML/JS/CSS prototype (client-side Gemini calls, no backend) — kept for reference, not served or maintained.

## Quick start (Windows)

**Backend**

```powershell
cd server
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py
```

Default config uses a local SQLite file — no database server to install. Tables are created and the card catalog is seeded automatically on first run.

**Frontend** (separate terminal)

```powershell
cd client
npm install
npm run dev
```

Open `http://localhost:3000`. No account or login — the auth endpoints exist in the API but nothing on the frontend calls them.

After the first-time setup above, `RUN.bat` at the repo root starts both servers.

## How it works

1. Upload a statement (PDF/CSV) or enter spending manually — sliders per category, or a 7-question swipe quiz if you'd rather not type numbers
2. Uploaded statements get parsed and each transaction categorized (13 categories, rule-based with an ML fallback)
3. Every eligible card in the catalog is scored against the resulting spend profile
4. Optional preferences narrow the pool first — exclude specific banks, cap the annual fee, require lounge access
5. Top 5 cards come back ranked, each with its net annual benefit, effective reward rate, and a one-line reason it ranked where it did

## Features

- Statement upload (PDF/CSV) with merchant categorization
- Manual spend entry via sliders, or a swipeable lifestyle quiz as a third input method
- Top 5 ranked recommendations, not just one — swipeable deck plus a full written breakdown
- Preferences: bank exclusion, max annual fee, lounge-access requirement
- Card directory: search/filter/sort the full catalog
- Save cards (localStorage) and compare up to 3 side by side
- Downloadable image of your top match
- Statement files are deleted from disk immediately after parsing; raw transactions are never sent to the chat endpoint, only category totals

## Project structure

```
SwipeRight/
├── client/                # Next.js 15 frontend
│   ├── src/app/           # pages (dashboard, cards, saved, compare, quiz, ...)
│   ├── src/components/    # shared UI + feature components
│   └── src/lib/           # API client, constants, hooks
│
├── server/                # FastAPI backend
│   ├── api/v1/endpoints/  # route handlers
│   ├── core/              # config, JWT/security utilities
│   ├── database/          # models, session, card seed data
│   ├── ml/                # transaction categorizer, recommendation engine
│   ├── services/          # statement parser (PDF/CSV)
│   └── tests/
│
├── legacy/                 # original static prototype, unmaintained
└── RUN.bat
```

## Environment variables

Copy `server/.env.example` to `server/.env`:

```env
DATABASE_URL=sqlite:///./swiperight.db

# Required if ENVIRONMENT=production — startup fails without them.
# In development they're auto-generated when unset, which means tokens/
# encrypted data won't survive a restart. Set them explicitly if that matters.
SECRET_KEY=
AES_KEY=

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

GEMINI_API_KEY=

ENVIRONMENT=development
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
RATE_LIMIT_PER_MINUTE=60
```

`GEMINI_API_KEY` is only used by `/api/chat`; leave it blank and that endpoint returns a canned response instead of failing. `server/.env` is gitignored.

## API

Base path `/api`. Full interactive docs at `/api/docs` once the server is running.

| Endpoint | Notes |
|---|---|
| `POST /upload/`, `POST /upload/analyze/{id}` | Upload and parse a statement |
| `POST /recommendation/` | Rank cards. Takes `statement_id` **or** `manual_category_totals`, plus optional `top_n`, `excluded_issuers`, `max_annual_fee`, `require_lounge_access` |
| `GET /cards/` | Browse the catalog — `search`, `issuer`, `network`, `tag`, `max_annual_fee`, `lounge_access`, `sort_by`, `sort_dir` |
| `GET /cards/issuers` | Distinct issuer names, for the bank-exclusion filter |
| `POST /chat/` | Ask about a saved recommendation (category totals only, no raw transactions) |
| `POST /auth/register`, `POST /auth/login` | Present, unused by the current frontend |

## Card catalog

23 real Indian cards, seeded from `server/database/seed_cards.py` — HDFC, SBI, ICICI, Axis, IDFC FIRST, Amex, Standard Chartered, Kotak, AU Bank. Seeding is idempotent (skips if cards already exist) and runs automatically at startup; `python -m database.seed_cards` also works standalone. Add cards by extending `cards_data` in that file.

## Tech stack

**Frontend** — Next.js 15, TypeScript, Tailwind, Framer Motion, Recharts, Zustand, Axios

**Backend** — FastAPI, SQLAlchemy, SQLite/Postgres, scikit-learn, pdfplumber/PyPDF2, slowapi

## Testing

```powershell
# Backend
cd server
.\venv\Scripts\activate
python -m pytest

# Frontend
cd client
npm test          # unit tests (Vitest)
npm run type-check
npm run lint
```

## Deployment notes

There's no Docker setup or CI/CD here — this runs as two local processes. For a real deployment: point `DATABASE_URL` at Postgres, set `ENVIRONMENT=production` (forces `SECRET_KEY`/`AES_KEY` to be set explicitly), `npm run build && npm start` for the frontend, and run the backend behind `uvicorn main:app` with a process manager.

## Known limitations

- No auth by default — any statement, recommendation, or chat is reachable by ID with no ownership check. JWT auth exists in `core/security.py` and is fully wired on the auth endpoints themselves, it's just not required anywhere else. Fine for local/single-user use; re-enable it (`Depends(get_current_user)` on the upload/recommendation/chat routes, plus scoping queries by `user_id`) before exposing this publicly with real data.
- Only the #1-ranked recommendation is persisted to the database (for `/history` and chat context). Ranks 2–5 are returned in the response but not stored — recomputing them from the same inputs is cheap, so this avoids a schema change for data that's disposable.
- The PDF parser handles clean tabular exports and common free-text statement formats; anything unusual will fall back to a 422 rather than silently returning wrong numbers.

## License

MIT — see `LICENSE`.
