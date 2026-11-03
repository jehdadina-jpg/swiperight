"""Builds the mini-project report by filling the department template in place."""
import os
import re
import shutil
import zipfile

from PIL import Image, ImageDraw, ImageFont

from docx_lib import (bullet, caption, code_block, esc, h1, h2, image, p, table, TEXT_WIDTH_TWIPS)

TEMPLATE = r"C:\Users\mdadi\Downloads\MiniProject_Report_FSD (1).docx"
OUT = r"C:\Users\mdadi\Downloads\projects\SwipeRight\docs\SwipeRight_MiniProject_Report.docx"
FIGS = "figs"
REPO_URL = "https://github.com/jehdadina-jpg/swiperight"
TITLE = "SwipeRight: Credit Card Recommendation Platform"

# ------------------------------------------------------------------ repo tree figure
def repo_tree_image(path):
    root = r"C:\Users\mdadi\Downloads\projects\SwipeRight\mern"
    skip = {"node_modules", "dist", ".env", "package-lock.json", "swiperight.db"}
    lines = ["swiperight/", "|-- mern/                      MERN edition (this report)"]

    def walk(d, prefix, depth):
        names = sorted(n for n in os.listdir(d) if n not in skip)
        dirs = [n for n in names if os.path.isdir(os.path.join(d, n))]
        files = [n for n in names if not os.path.isdir(os.path.join(d, n))]
        for n in dirs + files:
            full = os.path.join(d, n)
            if os.path.isdir(full):
                lines.append(f"{prefix}|-- {n}/")
                if depth < 3 and n not in ("public", "ui", "data", "models", "middleware"):
                    walk(full, prefix + "|   ", depth + 1)
                elif n in ("models", "middleware"):
                    walk(full, prefix + "|   ", depth + 1)
            else:
                lines.append(f"{prefix}|-- {n}")

    walk(root, "|   ", 1)
    lines += ["|-- server/                    FastAPI prototype (earlier version)", "|-- client/                    Next.js prototype (earlier version)", "|-- legacy/                    static first draft"]
    font = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", 19)
    lh = 26
    img = Image.new("RGB", (1200, 60 + lh * len(lines) + 20), "#fbfbfd")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 1200, 40], fill="#24292f")
    d.text((20, 9), "github.com/jehdadina-jpg/swiperight  (repository layout)", font=font, fill="#ffffff")
    y = 56
    for ln in lines:
        col = "#0550ae" if ln.rstrip().endswith("/") or "/ " in ln else "#24292f"
        d.text((24, y), ln, font=font, fill=col)
        y += lh
    img.save(path)


repo_tree_image(f"{FIGS}/fig_repo.png")

# ------------------------------------------------------------------ figure / table registries
FIGURES = []  # (file, caption)
TABLES = []


def fig(file, text, width=TEXT_WIDTH_TWIPS):
    FIGURES.append((file, text))
    n = len(FIGURES)
    rid = f"rIdImg{n}"
    return image(rid, 100 + n, f"{FIGS}/{file}", width) + caption(f"Figure {n} \u2013 {text}")


def tbl(title, header, rows, widths):
    TABLES.append(title)
    n = len(TABLES)
    return caption(f"Table {n} \u2013 {title}", keep_next=True) + table(header, rows, widths)


# ------------------------------------------------------------------ body content
B = []
a = B.append

# 1 ---------------------------------------------------------------
a(h1("1. Introduction"))
a(h2("1.1 Background"))
a(p("Credit cards in India are sold on headline numbers: a ten percent cashback here, an airport lounge there, a joining gift worth a few thousand rupees. "
    "What a card is actually worth to a particular person depends on how that person spends. Someone who puts most of their money into fuel and groceries "
    "gains little from a premium travel card with a twelve thousand rupee annual fee, while a frequent flyer can easily recover that fee in a single quarter. "
    "India has well over sixty widely marketed cards from a dozen or more issuers, each with its own reward rates, monthly caps, milestone bonuses and "
    "fee-waiver conditions, spread across separate issuer web pages."))
a(p("Comparison websites exist, but most rank cards by a fixed editorial order or by sponsorship, not by the visitor's own spending. Working out the real "
    "annual benefit by hand means reading each card's terms, applying the caps correctly, and subtracting the fee for every card on the shortlist. "
    "Most people do not do this, so they pick a card because a relative or a bank executive suggested it."))
a(p("SwipeRight is a web application that does that arithmetic for the user. It takes a spending profile, ranks the cards in its catalogue by expected "
    "net yearly benefit, and presents the five best as a deck of cards that can be swiped left (pass) or right (shortlist). The application is built "
    "entirely on the MERN stack: MongoDB for storage, Express.js and Node.js for the API, and React for the interface."))

a(h2("1.2 Problem Statement"))
a(p("Salaried individuals and students in India who are choosing a credit card have no quick, unbiased way to find out which card suits their own spending. "
    "Published comparisons ignore individual spending patterns, and reward structures (multipliers, per-category caps, milestones, fees) are too intricate "
    "to compare by hand across dozens of products."))
a(p("The improvement required is a system that accepts a user's actual or estimated spending, applies each card's reward rules faithfully, and returns a short, "
    "ranked, explained list, while letting the user exclude banks they do not want, cap the annual fee, or insist on lounge access."))

a(h2("1.3 Proposed Solution"))
a(p("The user can describe their spending in three ways: by uploading a bank or card statement (PDF or CSV), by dragging sliders for each of thirteen spending "
    "categories, or by logging expenses one at a time after signing in. In every case the input is reduced to yearly spend per category. The API then "
    "loads the eligible cards from MongoDB, computes the rewards each one would earn on that spend, subtracts the annual fee, and ranks the cards using a "
    "weighted score. The five best are returned with a plain-language explanation and shown in the browser as a swipe deck, a ranked breakdown and a spending chart."))
a(p("**MongoDB** stores users, the 64-card catalogue, uploaded statements and their transactions, manual expenses, shortlisted cards and past recommendations. "
    "**Express.js on Node.js** exposes a REST API with JWT authentication, request validation and rate limiting, and hosts the statement parser and the "
    "recommendation engine. **React** (built with Vite) provides the dashboard, card directory, comparison view, expense tracker and the swipe interaction."))

a(h2("1.4 Objectives and Scope"))
for o in [
    "Build a full-stack web application on MongoDB, Express.js, React and Node.js with a clean separation between client, API and database.",
    "Turn a bank statement, slider estimates or logged expenses into yearly spend per category, with a categoriser covering thirteen categories.",
    "Rank a catalogue of 64 real Indian credit cards by net annual benefit, applying reward caps, milestones and fees correctly.",
    "Provide full CRUD for user-owned data (expenses and shortlisted cards) behind JWT authentication, with ownership enforced on every query.",
    "Support preferences (excluded banks, maximum fee, lounge access), side-by-side comparison of up to three cards, and a downloadable card image.",
    "Validate all input, return consistent error messages, and cover the API and the reward maths with automated tests.",
]:
    a(bullet(o))
a(p("**Included:** the web client, the REST API, the MongoDB data model, statement parsing for text-based PDFs and CSV exports, the recommendation engine, and "
    "automated API and unit tests. **Not included:** OCR for scanned statements, live bank integrations, card application or payment flows, an admin web interface "
    "(catalogue maintenance is available through admin-only API routes), and cloud deployment."))

# 2 ---------------------------------------------------------------
a(h1("2. Requirements and Technology Stack"))
a(h2("2.1 Users and Functional Requirements"))
a(p("The application has two kinds of users. A **guest** can browse the catalogue, upload a statement, enter slider estimates, take the quiz and receive "
    "recommendations without creating an account. A **registered user** additionally keeps expenses and a shortlist that are stored in MongoDB and follow them across "
    "devices. An **admin** (a user whose role is set to admin) can maintain the card catalogue through the API."))
a(tbl("Functional requirements", ["ID", "User/Function", "Description"], [
    ["FR1", "Account management", "Register with email and password, sign in, receive a JWT, view own profile. Guests can use the product without an account."],
    ["FR2", "Card directory", "Browse all 64 cards with search by name or issuer, filters (issuer, lounge access, lifetime-free) and sorting by reward rate, annual fee or name."],
    ["FR3", "Statement analysis", "Upload a PDF or CSV statement (up to 10 MB). Transactions are parsed, categorised into 13 categories, and totalled; the period is scaled to 12 months."],
    ["FR4", "Estimated spend", "Enter yearly spend per category with sliders, or answer a swipe quiz that infers spend levels."],
    ["FR5", "Expense tracker (CRUD)", "Signed-in users add, view, filter, edit and delete expenses; the trailing 12 months can be used as the spending profile."],
    ["FR6", "Ranked recommendations", "Return the top five cards with net annual benefit, effective reward rate, breakeven spend and an explanation; honour excluded banks, fee cap, lounge requirement, income and CIBIL."],
    ["FR7", "Shortlist and compare", "Swipe right to shortlist a card; saved cards (with notes) persist per user; compare up to three cards side by side; download the winning card as an image."],
    ["FR8", "Catalogue administration", "Admins create, update and soft-delete cards through protected API routes."],
], [700, 2100, 6226]))

a(h2("2.2 Non-Functional Requirements"))
a(tbl("Non-functional requirements", ["Category", "Requirement"], [
    ["Usability", "Responsive layout from phone to desktop; guest access with no sign-up wall; clear error messages for bad files and invalid input; keyboard-accessible controls and labelled form fields."],
    ["Performance", "Ranking 64 cards is an in-memory computation; the API test run measured each recommendation request in tens of milliseconds. Catalogue queries are indexed on name and issuer."],
    ["Reliability", "Every route is wrapped so rejected promises reach a central error handler; invalid ids return 404 rather than crashing; duplicate keys return 409; deleting a catalogue card is a soft delete so older shortlists keep working."],
    ["Security", "Passwords hashed with bcrypt; JWT bearer authentication; helmet security headers; CORS restricted to the client origin; rate limiting on sign-in and sign-up; uploads kept in memory and never written to disk; every user-owned query filters by the authenticated user."],
    ["Maintainability", "Routes, services (parsing, categorising, scoring) and Mongoose models are separate modules; request validation lives in zod schemas; 30 automated tests guard the behaviour."],
], [1700, 7326]))

a(h2("2.3 MERN Technology Stack"))
a(tbl("Technology stack", ["Layer", "Technology", "Purpose"], [
    ["Frontend", "React 18, Vite 5, TypeScript, react-router 6", "UI, components and client-side routing"],
    ["Frontend libraries", "Tailwind CSS, Framer Motion, Recharts, Zustand, Axios, react-dropzone, html-to-image", "Styling, swipe animation, spending chart, client state, HTTP, file upload, card image export"],
    ["Backend", "Node.js 18+ with Express.js 4", "Server and REST APIs"],
    ["Backend libraries", "Mongoose, zod, jsonwebtoken, bcryptjs, multer, csv-parse, pdf-parse, helmet, cors, express-rate-limit, morgan", "ODM, validation, authentication, uploads, statement parsing, security and logging"],
    ["Database", "MongoDB with Mongoose", "Data storage and modelling"],
    ["Testing", "node:test, supertest, mongodb-memory-server", "Unit and API/integration tests against an in-memory MongoDB"],
    ["Version Control", "Git and GitHub", "Source control"],
    ["Deployment", "N.A. (runs locally)", "Not deployed; MongoDB Atlas and a Node host are the intended targets"],
], [1500, 4126, 3400]))

# 3 ---------------------------------------------------------------
a(h1("3. System Design"))
a(h2("3.1 System Architecture"))
a(p("The system is a three-tier MERN application. The React client talks to the Express API over HTTP using JSON; in development the Vite dev server proxies "
    "`/api` to Express so no CORS configuration is needed. Express validates each request, applies authentication where required, and uses Mongoose to read and "
    "write MongoDB. Statement files arrive as multipart uploads, are parsed in memory and discarded; only the extracted transactions are stored."))
a(fig("fig1_architecture.png", "System architecture and request/response path", 7400))

a(h2("3.2 Modules and Workflow"))
a(tbl("Application modules", ["Module", "Main Functions"], [
    ["Authentication", "Register, sign in, JWT issue and verification, optional and required auth middleware, admin role check."],
    ["Card catalogue", "Seeded list of 64 cards across 15 issuers; search, filter, sort, issuer list; admin create, update and soft delete."],
    ["Statement analysis", "Multipart upload, CSV and PDF-text parsing, date and amount normalisation, merchant cleaning, categorisation into 13 categories, recurring-charge detection, annualisation."],
    ["Expense tracker", "Create, list, filter, update and delete expenses; trailing 12-month totals per category."],
    ["Recommendation engine", "Eligibility filtering, per-category reward calculation with caps, milestone bonuses, net benefit, weighted score, ranking, explanation text."],
    ["Shortlist and compare", "Swipe deck, saved cards with notes (MongoDB for signed-in users, localStorage for guests), side-by-side comparison, card image download."],
], [2200, 6826]))
a(p("The end-to-end flow is shown in Figure 2. The input stage produces yearly spend per category; the engine filters, scores and ranks; the client turns the "
    "ranked list into an interaction the user can act on."))
a(fig("fig3_workflow.png", "Application workflow and data flow", 7400))

a(h2("3.3 Database Design"))
a(p("MongoDB holds seven collections. References between them are stored as ObjectIds and resolved with Mongoose `populate` where needed. Statements embed their "
    "per-category totals because they are always read together; transactions are a separate collection because a statement can contain hundreds of them. The "
    "relationships are drawn in Figure 3."))
a(fig("fig4_schema.png", "Database design: collections and references", 7400))
a(tbl("Collections", ["Collection", "Important Fields", "Purpose"], [
    ["users", "email (unique, lower-cased), fullName, passwordHash, role", "Accounts and roles. The hash is removed from every JSON response."],
    ["cards", "name, issuer, network, annualFee, joiningFee, rewardRate, rewardCaps, dining/travel/fuel/shopping/otherBenefits, milestones, loungeAccess, tags[], minIncome, minCibil, churnRisk, isActive", "The card catalogue the engine scores against."],
    ["statements", "user (optional), fileName, fileType, periodDays, transactionCount, totalSpending, categoryTotals[]", "One row per analysed upload with its category totals."],
    ["transactions", "statement, date, merchant, normalizedMerchant, amount, type, category, confidence", "Parsed and categorised transactions."],
    ["expenses", "user, date, merchant, amount, category, note", "Manually logged spending, owned by one user."],
    ["savedcards", "user, card, note; unique index on (user, card)", "A user's shortlist; the unique index makes saving idempotent."],
    ["recommendations", "user (optional), card, categoryTotals, yearlySpend, totalRewards, effectiveRewardRate, netAnnualBenefit, reasoning, score", "The top pick of each run, shown as history."],
], [1500, 4700, 2826]))

a(h2("3.4 API Design"))
a(p("All routes are under `/api`. Errors are returned as `{ \"error\": \"message\" }` with an appropriate status code (400 validation, 401 not signed in, "
    "403 not an admin, 404 not found, 409 duplicate, 413 file too large, 422 unreadable statement)."))
a(tbl("REST API endpoints", ["Method", "Endpoint", "Purpose"], [
    ["POST", "/api/auth/register", "Create account, return JWT and user"],
    ["POST", "/api/auth/login", "Sign in, return JWT and user"],
    ["GET", "/api/auth/me", "Current user (auth)"],
    ["GET", "/api/cards", "Read all cards: search, issuer, network, tag, maxAnnualFee, loungeAccess, sortBy, sortDir, limit, offset"],
    ["GET", "/api/cards/issuers", "Distinct issuer names"],
    ["GET", "/api/cards/:id", "Read one card"],
    ["POST", "/api/cards", "Create card (admin)"],
    ["PUT", "/api/cards/:id", "Update card (admin)"],
    ["DELETE", "/api/cards/:id", "Soft-delete card (admin)"],
    ["POST", "/api/statements", "Upload PDF/CSV, return categorised totals"],
    ["GET", "/api/statements", "List own statements (auth)"],
    ["GET", "/api/statements/:id", "Read one statement with transactions"],
    ["DELETE", "/api/statements/:id", "Delete own statement (auth)"],
    ["POST", "/api/expenses", "Create expense (auth)"],
    ["GET", "/api/expenses", "Read own expenses, optional category/date filter (auth)"],
    ["GET", "/api/expenses/summary", "Trailing 12-month totals per category (auth)"],
    ["PUT", "/api/expenses/:id", "Update own expense (auth)"],
    ["DELETE", "/api/expenses/:id", "Delete own expense (auth)"],
    ["POST", "/api/saved", "Save a card to the shortlist (auth)"],
    ["GET", "/api/saved", "Read shortlist with card details (auth)"],
    ["PUT", "/api/saved/:id", "Update the note on a saved card (auth)"],
    ["DELETE", "/api/saved/:id", "Remove from shortlist (auth)"],
    ["POST", "/api/recommendations", "Rank cards for a statement, slider totals or logged expenses"],
    ["GET", "/api/recommendations/history", "Own past top picks (auth)"],
    ["GET", "/api/health", "Liveness and database status"],
], [1000, 3000, 5026]))

# 4 ---------------------------------------------------------------
a(h1("4. Application Design and Implementation"))
a(h2("4.1 User Interface and Navigation"))
a(p("The interface uses a warm near-black palette with a single ember-orange accent, a serif display face for headings and a clean sans-serif for body text. "
    "A fixed top bar carries the logo and links to Dashboard, Card Directory, Quiz, Expenses and Saved, plus the sign-in control. The landing page is a "
    "scroll-locked, four-slide introduction that explains the name (swipe left to pass, swipe right to shortlist) before sending the visitor to the dashboard."))
a(fig("ui_landing.png", "Landing page", 6800))
a(p("The dashboard is the main working screen. The left column holds the input mode (upload a statement, manual sliders or logged expenses), the preferences panel "
    "and the results; the right column explains the flow. After a request, the best match is shown as a card with its net yearly benefit, followed by a donut chart "
    "of the spend used, the swipe deck, and a ranked breakdown with breakeven progress for each of the five cards."))
a(fig("ui_dashboard.png", "Dashboard in manual-entry mode", 6800))
a(fig("ui_dashboard_deck.png", "Results: best match, spend breakdown and swipe deck", 6800))
a(p("The Card Directory lists every card as a rendered card face (colour by issuer, metal finish for flagship products) with its highlight, fee and reward rate. "
    "Cards can be ticked for comparison. The Expenses page lets a signed-in user add, edit and delete expenses and shows totals per category."))
a(fig("ui_cards.png", "Card directory with search, filters and sorting", 6800))
a(fig("ui_expenses.png", "Expense tracker (signed-in user)", 6800))
a(p("The layout is responsive: grids collapse to a single column on narrow screens, and the navigation and forms remain usable at phone width."))

a(h2("4.2 Frontend Implementation"))
a(p("The client is a single-page React application written in TypeScript. `main.tsx` mounts the app inside a `BrowserRouter`; `App.tsx` declares the routes with "
    "react-router. The landing, login and register pages render on their own, while the other pages share an `AppLayout` that renders the navigation bar and a "
    "route-transition wrapper around an `<Outlet />`."))
for b in [
    "**Pages:** Landing, Dashboard, Cards, Compare, Saved, Quiz, Expenses, Login and Register, one file each under `src/pages`.",
    "**State:** two Zustand stores. `useAuth` holds the signed-in user and restores the session from the stored JWT by calling `/api/auth/me` on load. `useSavedCards` keeps the shortlist in localStorage for guests and mirrors it to MongoDB when a user is signed in, merging any guest cards on sign-in.",
    "**Forms:** controlled components with client-side checks (empty merchant, non-positive amount, password length) before the request, and server messages displayed on failure.",
    "**Hooks and effects:** `useEffect` loads the card list with a 250 ms debounce on search and filter changes; a custom `useCountUp` animates the benefit figure; `useSearchParams` reads the comparison ids and the dashboard source.",
    "**API layer:** one Axios instance adds the bearer token to every request; helper functions group calls by resource; `errorMessage` turns an Express error body into text for the user.",
    "**Interaction:** the swipe deck uses Framer Motion drag gestures; spend is charted with Recharts; the winning card can be exported as a PNG with html-to-image.",
]:
    a(bullet(b))

a(h2("4.3 Backend and API Implementation"))
a(p("`app.js` builds the Express application. Middleware runs in a fixed order: `helmet` for security headers, `cors` limited to the client origin, `express.json` with a "
    "100 KB body limit, `morgan` request logging, and a rate limiter on the auth routes (50 requests per 15 minutes). Resource routers are mounted under `/api`, "
    "followed by a 404 handler and a central error handler."))
a(p("Each router file owns one resource. Handlers are wrapped in a small `wrap` function so a rejected promise is forwarded to the error handler instead of hanging the "
    "request. Input is parsed with zod schemas through a `parse` helper that converts the first failing field into a readable 400 message. Authentication is split into "
    "`optionalAuth` (attach the user if a valid token is present, used by upload and recommendation so guests still work) and `requireAuth` (reject with 401), with "
    "`requireAdmin` layered on top for catalogue writes."))
a(p("Three services hold the domain logic. The **statement parser** reads CSV with delimiter detection and Dr/Cr handling, and reads PDF text with date and amount "
    "patterns that require paise so that time fragments are not mistaken for amounts. The **categoriser** maps merchants to thirteen categories with word-bounded rules "
    "and re-labels repeated similar charges as subscriptions. The **recommendation engine** is described below."))
a(p("**Reward calculation.** For each category the engine takes the better of the base rate and the card's multiplier or cashback, then applies a cap: an explicit "
    "category cap, otherwise the card's monthly cap times twelve, otherwise a default of \u20b92,000 a month above base for any boosted category. Because the "
    "catalogue's `rewardRate` is a headline figure, ordinary spend is credited at no more than 2%, and boosts tied to named partner merchants apply to 25% of the "
    "category. Milestone bonuses are added once. Net benefit is rewards minus the annual fee."))
a(p("**Ranking.** The score is 40% net benefit (expressed as a percentage of yearly spend so it shares a 0\u2013100 scale), 30% category fit (spend in categories "
    "the card is tagged for), 20% premium features (lounge, concierge, golf, travel insurance) and 10% low annual fee. A statement covers a few weeks or months, "
    "so its totals are scaled by 365 divided by the period it spans before scoring."))
a(code_block([
    "router.post('/', optionalAuth, wrap(async (req, res) => {",
    "  const input = parse(requestSchema, req.body);        // zod: exactly one input source",
    "  const totals = await resolveTotals(req, input);      // statement | sliders | my expenses",
    "  const ranked = await recommendCards(totals, input);  // filter, score, sort, top N",
    "  res.json({ recommendations, categoryTotalsUsed: totals });",
    "}));",
]))

a(h2("4.4 Database and CRUD Implementation"))
a(p("Mongoose schemas define types, required fields, enums, bounds and indexes. For example the expense schema restricts `category` to the thirteen valid values, "
    "requires `amount` to be at least 0.01 and indexes `(user, date)` for the common list query; the saved-card schema has a unique index on `(user, card)`."))
a(code_block([
    "const expenseSchema = new mongoose.Schema({",
    "  user:     { type: ObjectId, ref: 'User', required: true, index: true },",
    "  date:     { type: Date, required: true, default: Date.now },",
    "  merchant: { type: String, required: true, trim: true, maxlength: 120 },",
    "  amount:   { type: Number, required: true, min: 0.01 },",
    "  category: { type: String, required: true, enum: CATEGORIES },",
    "  note:     { type: String, trim: true, maxlength: 300, default: '' },",
    "}, { timestamps: true });",
]))
a(tbl("CRUD operations (expense tracker)", ["CRUD", "Frontend Action", "Backend/Database Action"], [
    ["Create", "\"Add expense\" form on the Expenses page", "POST /api/expenses; zod validates; Expense.create with the user id from the JWT"],
    ["Read", "Recent expenses list, category filter, category totals", "GET /api/expenses (Expense.find, sorted by date) and /api/expenses/summary (aggregation grouped by category over 12 months)"],
    ["Update", "Pencil icon loads the row into the form; \"Save changes\"", "PUT /api/expenses/:id; findOneAndUpdate filtered by id and user, with validators"],
    ["Delete", "Trash icon on a row", "DELETE /api/expenses/:id; findOneAndDelete filtered by id and user; 404 if it belongs to someone else"],
], [1100, 3600, 4326]))
a(p("The shortlist follows the same pattern: saving a card is an upsert, the note on a saved card is updated with PUT, and removal is a DELETE. The 64-card catalogue "
    "is seeded automatically the first time the API starts against an empty database."))

a(h2("4.5 Validation and Error Handling"))
a(p("Validation happens at three levels: zod schemas on the request, Mongoose schema rules on the document, and checks inside services. A central error handler maps "
    "each kind of failure to a status and a short message. Three examples from the running system:"))
for b in [
    "**Invalid recommendation input.** Posting a negative category amount, or no amount at all, returns 400 with a message such as \"Enter a positive amount in at least one spending category\"; the client shows it where the results would appear.",
    "**Unreadable statement.** A file with the wrong extension returns 400; a CSV with no recognisable transaction rows returns 422 \"Couldn't find any transactions in this statement\", and the upload zone displays that message.",
    "**Identity and ownership.** Registering an email that already exists returns 409; a wrong password and an unknown email both return the same 401 text; deleting another user's expense returns 404, so the existence of other users' data is not revealed.",
]:
    a(bullet(b))
a(p("Malformed JSON bodies, invalid ObjectIds, oversize uploads (413) and MongoDB duplicate-key errors are also translated into clear responses instead of stack traces."))

# 5 ---------------------------------------------------------------
a(h1("5. Testing and Results"))
a(h2("5.1 Testing Approach"))
a(p("Testing combined automated and manual work, and all results below come from actually running the code."))
for b in [
    "**API and integration tests (15).** Written with `node:test` and supertest. They run the real Express application against a MongoDB instance started in memory by mongodb-memory-server, covering authentication, CRUD with ownership checks, catalogue filtering and sorting, preference filters, statement upload and the recommendation endpoint.",
    "**Unit tests (15).** Cover the categoriser, date parsing, CSV and PDF-text parsing, annualisation and the reward arithmetic (caps, fuel cashback, milestones, headline-rate ceiling, partner share).",
    "**Manual and scripted UI testing.** The pages were exercised in Microsoft Edge by a scripted browser run (landing, dashboard in manual and expense modes, card directory, expenses, mobile width) and the screenshots in Chapter 4 were taken from that run. There are no automated front-end tests.",
    "**Database verification.** Seeded data and written records were checked through the API and through Mongoose queries inside the tests. MongoDB Compass and Postman were not used.",
]:
    a(bullet(b))

a(h2("5.2 Test Cases"))
a(tbl("Test cases and results", ["ID", "Test Scenario", "Expected Result", "Actual Result", "Status"], [
    ["TC01", "Create expense (valid)", "201 with id", "201; record returned with id and the signed-in user as owner", "PASS"],
    ["TC02", "View expenses and filter by category", "Own records only", "2 records listed; category=Fuel returned 1", "PASS"],
    ["TC03", "Update expense amount", "Amount changes, other fields kept", "Amount 540 became 600; merchant unchanged", "PASS"],
    ["TC04", "Delete expense, then delete again", "204, then 404", "204, then 404", "PASS"],
    ["TC05", "Create expense with negative amount / unknown category", "400", "Both returned 400", "PASS"],
    ["TC06", "Another user deletes my expense", "404, record intact", "404; record still present for the owner", "PASS"],
    ["TC07", "Register duplicate email; wrong password; no token", "409; 401; 401", "409; 401; 401", "PASS"],
    ["TC08", "Catalogue is seeded and searchable", "64 cards; search \"infinia\" finds HDFC Infinia", "64 cards; search returned the Infinia card; fee filter and sorting correct", "PASS"],
    ["TC09", "Recommend from slider totals", "5 results in descending score, plausible rates", "5 results, scores descending, effective rates under 15%, net = rewards - fee", "PASS"],
    ["TC10", "Preferences: exclude HDFC Bank, max fee 1000, lounge only", "All results respect the filter", "No HDFC card; all fees \u2264 1000; all lounge-enabled", "PASS"],
    ["TC11", "Upload April CSV (6 rows, 1 credit)", "5 debits categorised; total 8,250 over 30 days", "6 rows parsed; spending 8,250; Dining 1,250; period 30 days; scaled to 12 months in recommendation", "PASS"],
    ["TC12", "Upload .txt file and an empty CSV", "400; 422", "400; 422 with the \"couldn't find any transactions\" message", "PASS"],
    ["TC13", "Save same card twice; edit note; remove", "One row; note saved; row gone", "Same row id returned; note updated; list empty after delete", "PASS"],
    ["TC14", "Admin-only catalogue write as guest / normal user", "401; 403", "401; 403", "PASS"],
], [650, 2200, 1900, 3476, 800]))
a(p("Result of the complete run: **30 tests, 30 passed, 0 failed** (Figure 9)."))

a(h2("5.3 API and Database Verification"))
a(p("Figure 9 shows the test run. Figure 10 shows live requests sent to the running API: a catalogue search, a ranking request whose three results land at "
    "effective reward rates of about 2\u20134% (down from implausible double-digit figures before the engine rules in section 4.3 were added), and three failure cases "
    "with their status codes and messages."))
a(fig("ev_tests.png", "Automated test run (30 of 30 passing)", 7000))
a(fig("ev_api.png", "Live API requests and error responses", 7000))
a(fig("ui_dashboard_expenses.png", "Recommendations generated from a signed-in user's logged expenses", 6800))

a(h2("5.4 Final Results"))
a(p("All eight functional requirements were implemented and exercised: accounts, the card directory, statement analysis, slider and quiz input, the expense tracker with "
    "full CRUD, ranked recommendations with preferences, the shortlist with comparison and image export, and admin catalogue routes. The test suite passes in full. "
    "The application runs locally against MongoDB; it has not been deployed."))
a(p("Known limitations: PDF parsing works on text-based statements and not on scanned images; the catalogue is a snapshot of publicly listed card terms and its reward "
    "rates are headline figures, so the engine's ceilings and the 25% partner share are stated assumptions, not issuer facts; and reward values are estimates, not guarantees."))

# 6 ---------------------------------------------------------------
a(h1("6. GitHub and Deployment"))
a(h2("6.1 GitHub Repository"))
a(p(f"The source is kept in the repository {REPO_URL}. The MERN edition described in this report lives under `mern/`, with the Express API in `mern/server` and the "
    "React client in `mern/client`; each has its own `package.json`, so the two can be installed and run independently. The earlier FastAPI and Next.js prototype "
    "remains in the repository for reference. The team worked on the main branch with small, descriptive commits (design pass, catalogue expansion, reward-maths fix)."))
a(fig("fig_repo.png", "GitHub repository structure", 6200))
a(p("To run the project: install dependencies in both folders, copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, then start the API (`npm run dev` in "
    "`server`) and the client (`npm run dev` in `client`). `npm run dev:mem` starts the API against a temporary in-memory MongoDB for quick demonstrations."))

a(h2("6.2 Deployment Details"))
a(tbl("Deployment details", ["Item", "Details"], [
    ["GitHub Repository", REPO_URL],
    ["Frontend URL", "N.A."],
    ["Backend URL", "N.A."],
    ["Database", "MongoDB (local instance; in-memory instance for tests). Connection string is read from MONGODB_URI, so MongoDB Atlas can be used without code changes."],
    ["Deployment Platform", "N.A. (not deployed)"],
], [2400, 6626]))

# 7 ---------------------------------------------------------------
a(h1("7. Challenges and Individual Contributions"))
a(h2("7.1 Challenges and Solutions"))
a(tbl("Challenges and solutions", ["Challenge", "Solution", "Outcome"], [
    ["Registration failed on a fresh setup because the relational database credentials did not match the environment.", "Moved persistence to MongoDB through a single connection string, seeded the card catalogue automatically on first start, and made accounts optional so the main flow never depends on sign-up.", "A fresh clone runs with one environment variable (or none, using the in-memory mode)."],
    ["Recommendation figures were inflated (benefits of tens of thousands of rupees from modest spend).", "Enforced reward caps (explicit, monthly, then a default ceiling), stopped fuel cashback from stacking on the base rate, excluded milestone bonuses from the displayed rate, normalised net benefit to a percentage of spend before weighting, capped ordinary-spend earn at 2% and applied partner-only boosts to a share of a category.", "Top results land at realistic 2\u20134% effective rates; the rules are covered by unit tests."],
    ["PDF statements produced zero or wrong transactions: times such as 11:22 were read as amounts and ordinal dates such as 1st November were missed.", "Required paise on amounts, added month-name and ordinal date parsing, took the first amount on a line rather than the running balance, and treated a leading \"credit\" as direction.", "Text statements are parsed correctly in tests; scanned PDFs remain unsupported."],
    ["CSV exports with a single Amount column counted salary credits as spending.", "Read Dr/Cr and Type columns, CR/DR suffixes and signs to decide direction, and counted only debits in category totals.", "Income no longer inflates spend."],
    ["A statement covers one month but rewards are yearly.", "Measured the date span of the transactions and scaled totals to 12 months before scoring.", "Monthly statements and slider estimates are comparable."],
    ["Porting the prototype from FastAPI and Next.js to a pure MERN stack while keeping the UI.", "Re-implemented the engine, parser and models in Node and Mongoose, replaced Next.js with Vite and react-router behind thin compatibility helpers, and renamed API fields to camelCase.", "Same interface on a MERN stack, type-checked and production-built."],
], [2700, 4126, 2200]))

a(h2("7.2 Individual Contributions"))
a(tbl("Individual contributions", ["Student", "Frontend", "Backend/API", "Database", "Testing/Deployment"], [
    ["Jeh Dadina (16010124038)", "Landing page, dashboard, card visuals and swipe deck, animations", "Recommendation engine, statement parser, categoriser", "Mongoose models for cards, statements and recommendations; catalogue seed", "Unit tests for the engine and parsers; run and screenshot scripts"],
    ["Rishi Dadia (16010124037)", "Card directory, compare and saved pages, expense tracker, auth pages", "Auth, expenses and saved-card routes, validation and error handling", "Models for users, expenses and saved cards; indexes", "API/integration tests; report and presentation"],
], [1750, 1900, 1900, 1800, 1676]))

# 8 ---------------------------------------------------------------
a(h1("8. Conclusion and Future Scope"))
a(h2("8.1 Conclusion"))
a(p("SwipeRight addresses a real decision problem: which credit card suits a particular person's spending. The application turns a statement, a set of estimates or a "
    "log of expenses into yearly spend by category, scores 64 Indian cards on what each would actually earn net of fees, and presents five ranked, explained matches "
    "that the user can shortlist and compare. It is built entirely on the MERN stack, with MongoDB collections for users, cards, statements, transactions, expenses, "
    "shortlists and recommendations, an Express API with JWT authentication and validated, ownership-checked CRUD, and a React client with routing, shared state and "
    "swipe interactions."))
a(p("The work was verified with 30 automated tests that pass, a scripted browser walkthrough, and live API requests. Most of the effort went into making the numbers "
    "trustworthy: enforcing reward caps, separating headline rates from base earn, and annualising statements, so that the ranking reflects realistic benefit. The "
    "project meets its functional requirements; deployment and scanned-statement support are the main items left."))
a(h2("8.2 Future Scope"))
for b in [
    "Deploy the API and client (MongoDB Atlas with a Node host and static hosting) and add a CI pipeline that runs the test suite on every push.",
    "Read statements through the Account Aggregator framework or an OCR service instead of manual uploads, including scanned PDFs.",
    "Replace the rule-based categoriser with a trained text classifier and let users correct categories to improve it.",
    "Store per-card base earn rates and partner-merchant shares as data, sourced from issuer terms, so the engine's assumptions become facts.",
    "An admin web console for catalogue maintenance and a scheduled job that flags cards whose published terms have changed.",
    "Eligibility pre-checks with income and CIBIL on the dashboard, and an AI assistant that explains a recommendation in conversation.",
    "Automated front-end and end-to-end tests, and server-side pagination for very large expense histories.",
]:
    a(bullet(b))

# References -------------------------------------------------------
REFS = [
    "React Team, \"React documentation,\" https://react.dev/.",
    "Express.js, \"Express 4.x API reference,\" https://expressjs.com/.",
    "OpenJS Foundation, \"Node.js documentation,\" https://nodejs.org/docs/.",
    "MongoDB, Inc., \"MongoDB manual,\" https://www.mongodb.com/docs/manual/.",
    "Automattic, \"Mongoose documentation,\" https://mongoosejs.com/docs/.",
    "Vite, \"Vite guide,\" https://vite.dev/guide/.",
    "React Router, \"React Router v6 documentation,\" https://reactrouter.com/.",
    "M. Jones, J. Bradley and N. Sakimura, \"JSON Web Token (JWT),\" RFC 7519, IETF, 2015.",
    "C. McDonnell, \"Zod: TypeScript-first schema validation,\" https://zod.dev/.",
    "Tailwind Labs, \"Tailwind CSS documentation,\" https://tailwindcss.com/docs.",
    "Framer, \"Motion for React documentation,\" https://motion.dev/docs/react.",
    "Node.js, \"Test runner (node:test),\" https://nodejs.org/api/test.html.",
]
REF_XML = "".join(
    '<w:p><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/><w:ind w:left="540" w:hanging="540"/></w:pPr>'
    f'<w:r><w:t xml:space="preserve">[{i}] {esc(r)}</w:t></w:r></w:p>'
    for i, r in enumerate(REFS, 1)
)

# ------------------------------------------------------------------ assemble
work = "report_build"
shutil.rmtree(work, ignore_errors=True)
with zipfile.ZipFile(TEMPLATE) as z:
    z.extractall(work)

doc_path = f"{work}/word/document.xml"
x = open(doc_path, encoding="utf-8").read()

# cover page
x = x.replace("[PROJECT TITLE]", esc(TITLE))
dup = re.search(r'<w:p [^>]*w14:paraId="4264B5F6".*?</w:p>', x, re.S)
x = x.replace(dup.group(0), "")  # the template prints "Submitted by" twice
x = re.sub(r"\[Student 1 Name [^\]]*\]", "Jeh Dadina \u2013 16010124038", x)
x = re.sub(r"\[Student 2 Name [^\]]*\]", "Rishi Dadia \u2013 16010124037", x)
x = re.sub(r'<w:r><w:br/><w:t>\[Student 3 Name [^\]]*\]</w:t></w:r>', "", x)
x = x.replace("[Paste Repository URL]", REPO_URL)
x = x.replace(
    '<w:pPr><w:spacing w:after="700"/><w:jc w:val="center"/></w:pPr><w:proofErr w:type="spellStart"/>',
    '<w:pPr><w:spacing w:after="700"/><w:jc w:val="center"/></w:pPr><w:r><w:t>Department of Computer Engineering</w:t></w:r><w:r><w:br/></w:r><w:proofErr w:type="spellStart"/>',
    1,
)

# body
start_h1 = x.index('<w:t>1. Introduction</w:t></w:r></w:p>', x.index("List of tables"))
p_start = x.rfind("<w:p ", 0, start_h1)
sect = x.index("<w:sectPr")
x = x[:p_start] + "".join(B) + h1("References") + REF_XML + x[sect:]

# list of figures / tables (template has a single empty entry for each)
def listing(label, items):
    return "".join(
        f'<w:p><w:pPr><w:spacing w:after="100"/></w:pPr><w:r><w:t xml:space="preserve">{label} {i}: {esc(t)}</w:t></w:r></w:p>'
        for i, t in enumerate(items, 1)
    )


x = re.sub(r'<w:p [^>]*>(?:(?!</w:p>).)*?<w:t xml:space="preserve">Figure 1: </w:t></w:r></w:p>',
           lambda m: listing("Figure", [c for _, c in FIGURES]), x, count=1, flags=re.S)
x = re.sub(r'<w:p [^>]*>(?:(?!</w:p>).)*?<w:t xml:space="preserve">Table 1: </w:t></w:r></w:p>',
           lambda m: listing("Table", TABLES), x, count=1, flags=re.S)

# namespaces needed by the drawing markup
root_tag = re.search(r"<w:document [^>]*>", x).group(0)
if "xmlns:wp=" not in root_tag:
    x = x.replace(root_tag, root_tag[:-1] + ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">', 1)
open(doc_path, "w", encoding="utf-8").write(x)

# images + relationships
rels_path = f"{work}/word/_rels/document.xml.rels"
rels = open(rels_path, encoding="utf-8").read()
add = ""
for n, (fname, _) in enumerate(FIGURES, 1):
    target = f"media/report_{n}_{fname}"
    shutil.copy(f"{FIGS}/{fname}", f"{work}/word/{target}")
    add += f'<Relationship Id="rIdImg{n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="{target}"/>'
open(rels_path, "w", encoding="utf-8").write(rels.replace("</Relationships>", add + "</Relationships>"))

# document properties
core = f"{work}/docProps/core.xml"
c = open(core, encoding="utf-8").read()
c = re.sub(r"<dc:title>.*?</dc:title>", f"<dc:title>{esc(TITLE)}</dc:title>", c, flags=re.S)
open(core, "w", encoding="utf-8").write(c)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT):
    os.remove(OUT)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    # [Content_Types].xml must come first
    z.write(f"{work}/[Content_Types].xml", "[Content_Types].xml")
    for folder, _, files in os.walk(work):
        for f in files:
            full = os.path.join(folder, f)
            arc = os.path.relpath(full, work).replace("\\", "/")
            if arc != "[Content_Types].xml":
                z.write(full, arc)
print("written", OUT, f"{len(FIGURES)} figures, {len(TABLES)} tables")
