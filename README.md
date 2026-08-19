# SwipeRight 💳
### AI-Powered Credit Card Recommendation Engine

A modern web application that analyzes bank statements and recommends **ONE** perfect credit card from 140+ Indian credit cards using AI and ML.

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
- 🤖 **ML Categorization** - Auto-categorize 13 spending categories
- 💳 **ONE Card** - Get exactly ONE best recommendation (SRS Rule 1)
- 🔒 **Privacy First** - Files deleted after processing (SRS Rule 2)
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
(`DATABASE_URL=sqlite:///./swiperight.db`) — no setup required, tables are
created automatically on first run.

To seed the credit card catalog:
```powershell
cd server
.\venv\Scripts\activate
python -m database.seed_cards
```

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

1. **Upload** - User uploads bank statement (PDF/CSV)
2. **Parse** - Extract transactions with merchant normalization
3. **Categorize** - ML model assigns 13 spending categories
4. **Calculate** - Analyze spending patterns and annual fees
5. **Recommend** - Return ONE best card with detailed reasoning
6. **Chat** - AI answers questions (category totals only, no raw data)

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
- `GET /api/cards` - Get all cards
- `POST /api/recommendation` - Get ONE card recommendation
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

140+ Indian credit cards included:

- Premium: Infinia, Magnus, Vistara Infinite
- Travel: Club Vistara, Diners Black, Axis Atlas
- Cashback: Amazon Pay ICICI, Flipkart Axis, SBI Cashback
- Fuel: BPCL Octane, HPCL Coral, IndianOil Axis
- Shopping: Myntra Kotak, HDFC Regalia, Citi Rewards

More cards added regularly!

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
