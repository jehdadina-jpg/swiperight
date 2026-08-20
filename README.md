# SwipeRight 💳
### AI-Powered Credit Card Recommendation Engine

A modern web application that analyzes bank statements (or manually entered spending) and ranks the **top 5** best-fit credit cards from a catalog of Indian credit cards using AI and ML.

> The production frontend is the Next.js app in `client/`. The original static
> HTML/JS/CSS prototype has been moved to `legacy/` and is kept for reference
> only — it is not served or maintained.

### Quick Start (Windows)

**Backend**
```powershell
cd server
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
# copy .env.example to .env — the default DATABASE_URL uses a local SQLite
# file, so no database server setup is needed to get started
python main.py
```

**Frontend** (separate terminal)
```powershell
cd client
npm install
npm run dev
```

Then open `http://localhost:3000`. No account or login is required — upload
a statement and go. (Registration/login endpoints still exist in the API for
future use, but nothing on the current frontend requires them.)

---

## ✨ Features

- 📊 **Statement Upload** - Drag & drop PDF/CSV bank statements
- ✍️ **Manual Entry** - Skip the upload entirely and enter estimated yearly spend per category
- 🤖 **ML Categorization** - Auto-categorize 13 spending categories
- 🏆 **Top 5 Ranking** - Ranked list of the 5 best-fit cards, not just one
- 🎛️ **Preferences** - Exclude specific banks, cap the annual fee, or require lounge access
- 📇 **Card Directory** - Browse, search, and filter every card in the system
- 🔒 **Privacy First** - Files deleted after processing
- 💬 **AI Chat** - Ask questions about your recommendation
- 🎨 **Beautiful UI** - Bloomberg-inspired dark mode dashboard

---

## 📋 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.12+** - [Download](https://www.python.org/downloads/)
- **PostgreSQL 14+** (optional) - [Download](https://www.postgresql.org/download/)

---

## 🗄️ Database Setup

By default (`server/.env.example`), the app uses a local SQLite file
(`DATABASE_URL=sqlite:///./swiperight.db`) — no setup required. Tables are
created and the credit card catalog is seeded automatically on first run
(`server/main.py` startup); `python -m database.seed_cards` also exists if
you need to run it manually (it's a no-op if cards already exist).

For Postgres instead, set `DATABASE_URL=postgresql://user:pass@localhost:5432/swiperight_db`
in `server/.env` and create the database first (`createdb swiperight_db`).

---

## 📁 Project Structure

```
SwipeRight/
├── client/                 # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # API client & utilities
│   └── package.json
│
├── server/                # FastAPI Backend
│   ├── api/v1/           # API endpoints
│   ├── core/             # Security & config
│   ├── database/         # Models & migrations
│   ├── ml/               # ML categorizer & recommender
│   ├── services/         # Statement parser
│   └── main.py
│
├── legacy/                # Old static HTML/JS/CSS prototype (reference only, not served)
└── README.md
```

---

## 🎯 How It Works

1. **Upload or enter spending** - Upload a bank statement (PDF/CSV), or skip straight to manual per-category amounts
2. **Parse** (upload only) - Extract transactions with merchant normalization
3. **Categorize** (upload only) - ML model assigns 13 spending categories
4. **Set preferences** - Optionally exclude banks, cap the annual fee, or require lounge access
5. **Calculate** - Score every eligible card against the spending pattern
6. **Recommend** - Return the top 5 cards, ranked, each with its own reasoning
7. **Chat** - AI answers questions (category totals only, no raw data)

---

## 🔑 Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

```env
DATABASE_URL=sqlite:///./swiperight.db

# Required in production (ENVIRONMENT=production) — the app fails fast at
# startup if these are missing when ENVIRONMENT=production. In development
# they're auto-generated if omitted, but that means tokens/encrypted data
# won't survive a restart, so set them explicitly even locally if that matters.
SECRET_KEY=your-secret-key-here
AES_KEY=your-aes-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

GEMINI_API_KEY=your-gemini-key-here

ENVIRONMENT=development
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
RATE_LIMIT_PER_MINUTE=60
```

Get a Gemini API key (free): https://aistudio.google.com/app/apikey

`server/.env` is gitignored — never commit real secrets.

---

## 🌐 API Endpoints

No authentication is required to use the app. `POST /api/auth/register` and
`/login` still exist and issue JWTs, but nothing currently requires the token.

- `POST /api/auth/register` / `POST /api/auth/login` - Create account / sign in (optional, unused by the frontend)
- `POST /api/upload/` - Upload statement
- `POST /api/upload/analyze/{id}` - Analyze statement
- `GET /api/cards/` - Browse cards (`search`, `issuer`, `network`, `tag`, `max_annual_fee`, `lounge_access`, `sort_by`, `sort_dir`)
- `GET /api/cards/issuers` - Distinct issuer names, for bank-exclusion filters
- `POST /api/recommendation/` - Rank the top N cards (`top_n`, default 5) for either a `statement_id` or `manual_category_totals`, with optional `excluded_issuers` / `max_annual_fee` / `require_lounge_access` preferences
- `POST /api/chat` - Ask AI questions
- `GET /api/docs` - Interactive API docs

---

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM
- **PostgreSQL** - Database
- **scikit-learn** - ML categorization
- **pandas** - Data processing
- **PyPDF2/pdfplumber** - PDF parsing
- **Google Gemini** - AI chat

---

## 🧪 Testing

```powershell
# Backend tests
cd server
.\venv\Scripts\activate
python -m pytest

# Frontend tests
cd client
npm test
```

---

## 🚀 Deployment

### Using Docker (coming soon)
```bash
docker-compose up
```

### Manual Deployment
1. Set up PostgreSQL database
2. Update `.env` with production values
3. Build frontend: `cd client && npm run build`
4. Run backend: `cd server && uvicorn main:app --host 0.0.0.0 --port 8000`
5. Serve frontend: `cd client && npm start`

---

## 📊 Card Database

23 real Indian credit cards are seeded by default (`server/database/seed_cards.py`),
spanning HDFC, SBI, ICICI, Axis, IDFC FIRST, American Express, Standard
Chartered, Kotak, and AU Bank — premium travel cards, cashback cards, and
lifetime-free options. Add more by extending the `cards_data` list in that
file; the seeder skips cards that already exist.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file

---

## 🐛 Troubleshooting

**Ports already in use?**
- Close apps using port 3000 or 8000

**Python dependencies fail?**
- Make sure Python 3.12+ installed
- Try: `pip install --upgrade pip`

**Node modules fail?**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

**Database errors?**
- App works without database (temp data)
- Or use SQLite instead of PostgreSQL

**Import errors?**
- Make sure virtual environment is activated
- Run: `pip install -r requirements.txt`

---

## 📞 Support

Questions? Open an issue on GitHub!

---

## ⚡ Performance

- Statement parsing: < 2s
- ML categorization: < 1s for 100 transactions
- Recommendation: < 500ms
- Database queries: < 100ms

---

## 🔐 Security

- No login is required — all statement/recommendation/chat data is
  effectively public within a given deployment (anyone with the URL can see
  any uploaded statement or recommendation by ID). Fine for local/demo use;
  if you deploy this publicly, re-enable the JWT auth in `core/security.py`
  (still present, just not wired into the endpoints) before storing real data.
- `SECRET_KEY`/`AES_KEY` must be set explicitly when `ENVIRONMENT=production`
  (the app refuses to start otherwise)
- Rate limiting (slowapi) on auth and upload endpoints
- Files deleted after processing
- No raw transaction data sent to AI
- SQL injection protection via SQLAlchemy
- Input validation on all endpoints

---

## 🎉 Credits

Built with ❤️ for the Indian credit card market

- ML models trained on synthetic data
- Card data from official bank sources
- UI inspired by Bloomberg Terminal

---

**Ready to try it?** After the first-time setup above, just double-click `RUN.bat`! 🚀
