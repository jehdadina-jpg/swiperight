"""SwipeRight mini-project presentation - same chapter order as the report."""
from PIL import Image, ImageFont
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

OUT = r"C:\Users\mdadi\Downloads\projects\SwipeRight\docs\SwipeRight_MiniProject_Presentation.pptx"
FIGS = "figs"
REPO = "github.com/jehdadina-jpg/swiperight"

INK, PANEL, PANEL2 = "12100E", "1E1915", "2A231D"
TEXT, MUTED = "F3EDE2", "B4AB9C"
EMBER, VERD = "FF5A2E", "7CB5A5"
HEAD, BODY = "Cambria", "Calibri"

W, H = 13.333, 7.5
MX = 0.6

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(W), Inches(H)
BLANK = prs.slide_layouts[6]

_font_cache = {}
FONT_FILES = {
    ("Calibri", False): r"C:\Windows\Fonts\calibri.ttf",
    ("Calibri", True): r"C:\Windows\Fonts\calibrib.ttf",
    ("Cambria", False): r"C:\Windows\Fonts\cambria.ttc",
    ("Cambria", True): r"C:\Windows\Fonts\cambriab.ttf",
}
problems = []


def rgb(h):
    return RGBColor.from_string(h)


def _font(face, bold, size):
    key = (face, bold, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONT_FILES[(face, bold)], int(size * 10))
    return _font_cache[key]


def lines_needed(text, face, bold, size, width_in):
    f = _font(face, bold, size)
    max_w = width_in * 72 * 10
    n = 0
    for para in text.split("\n"):
        words, cur, count = para.split(" "), "", 1
        for w in words:
            trial = (cur + " " + w).strip()
            if f.getlength(trial) <= max_w:
                cur = trial
            else:
                count += 1
                cur = w
        n += count
    return n


def bg(slide, color=INK):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = rgb(color)


def text(slide, x, y, w, h, paras, size=16, color=TEXT, face=BODY, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, name=None, space_after=6, italic=False):
    """paras: str or list of str | (str, dict). Verifies the text fits the box."""
    if isinstance(paras, str):
        paras = [paras]
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    if name:
        box.name = name
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    need = 0.0
    for i, item in enumerate(paras):
        t, o = (item, {}) if isinstance(item, str) else item
        sz = o.get("size", size)
        fc = o.get("face", face)
        bd = o.get("bold", bold)
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = o.get("align", align)
        para.space_after = Pt(o.get("space_after", space_after))
        run = para.add_run()
        run.text = t
        run.font.size, run.font.name, run.font.bold = Pt(sz), fc, bd
        run.font.italic = o.get("italic", italic)
        run.font.color.rgb = rgb(o.get("color", color))
        need += lines_needed(t, fc, bd, sz, w) * sz * 1.2 / 72 + o.get("space_after", space_after) / 72
    if need > h + 0.02:
        problems.append(f"overflow {need:.2f}in > {h:.2f}in: {str(paras[0])[:50]}")
    return box


def card(slide, x, y, w, h, fill=PANEL, radius=0.06, name=None):
    s = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    s.adjustments[0] = radius
    s.fill.solid()
    s.fill.fore_color.rgb = rgb(fill)
    s.line.fill.background()
    s.shadow.inherit = False
    if name:
        s.name = name
    return s


def pill(slide, x, y, w, h, label, fill=EMBER, color=INK, size=12):
    s = card(slide, x, y, w, h, fill, 0.5)
    tf = s.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.size, r.font.bold, r.font.name = Pt(size), True, BODY
    r.font.color.rgb = rgb(color)
    return s


def pic(slide, path, x, y, w, h, name=None):
    with Image.open(path) as im:
        iw, ih = im.size
    scale = min(w / iw, h / ih)
    pw, ph = iw * scale, ih * scale
    p = slide.shapes.add_picture(path, Inches(x + (w - pw) / 2), Inches(y + (h - ph) / 2), Inches(pw), Inches(ph))
    if name:
        p.name = name
    return p


counter = {"n": 0}


def content_slide(kicker, title, notes):
    s = prs.slides.add_slide(BLANK)
    bg(s)
    counter["n"] += 1
    text(s, MX, 0.42, 9, 0.3, kicker.upper(), size=12, color=EMBER, face=BODY, bold=True, name="kicker")
    text(s, MX, 0.72, W - 2 * MX, 0.75, title, size=34, face=HEAD, bold=True, name="title")
    text(s, MX, 7.02, 6, 0.25, "SwipeRight  |  FSD Mini Project  |  MERN stack", size=11, color=MUTED, name="footer")
    text(s, W - MX - 1, 7.02, 1, 0.25, str(len(prs.slides)), size=11, color=MUTED, align=PP_ALIGN.RIGHT, name="slide number")
    s.notes_slide.notes_text_frame.text = notes
    return s


# =============================================================== 1 title
s = prs.slides.add_slide(BLANK)
bg(s)
pic(s, "../../mern/client/public/logo.png", MX, 0.6, 3.2, 0.7, "logo")
text(s, MX, 2.1, 8.2, 1.9, "Find the card that actually fits you", size=54, face=HEAD, bold=True, name="title")
text(s, MX, 4.25, 7.6, 0.9,
     "A credit card recommendation platform for Indian spenders, built on MongoDB, Express, React and Node.",
     size=20, color=MUTED, name="subtitle")
card(s, 9.0, 1.6, 3.75, 4.4, PANEL, 0.05, "team card")
text(s, 9.3, 1.9, 3.2, 3.9, [
    ("Submitted by", {"size": 13, "color": EMBER, "bold": True}),
    ("Jeh Dadina", {"size": 20, "bold": True, "space_after": 0}),
    ("16010124038", {"size": 14, "color": MUTED, "space_after": 14}),
    ("Rishi Dadia", {"size": 20, "bold": True, "space_after": 0}),
    ("16010124037", {"size": 14, "color": MUTED, "space_after": 14}),
    ("Department of Computer Engineering", {"size": 14, "space_after": 2}),
    ("B.Tech, Third Year, Semester V", {"size": 14, "color": MUTED, "space_after": 2}),
    ("Mini Project: FSD (MERN Stack)", {"size": 14, "color": MUTED}),
], name="team")
text(s, MX, 6.75, 8, 0.3, REPO, size=13, color=VERD, name="repo link")
s.notes_slide.notes_text_frame.text = (
    "Jeh: Introduce the project in one breath. SwipeRight takes how you spend and tells you which of 64 Indian credit cards is worth the most to you. "
    "It is a MERN project: MongoDB, Express, React, Node. We will follow the same chapters as the report.")

# =============================================================== 2 introduction
s = content_slide("1  Introduction", "Cards are sold on headlines, not on you",
                  "Jeh: Explain the background. A 12,000 rupee fee card is a bargain for a frequent flyer and a loss for someone who mostly buys fuel and groceries. "
                  "Terms are scattered over a dozen issuer sites and nobody applies caps and fees by hand.")
text(s, MX, 1.75, 6.4, 3.2, [
    ("Sixty-plus popular cards, a dozen-plus issuers, each with its own rates, monthly caps, milestones and fee waivers.", {"space_after": 14}),
    ("What a card is worth depends on how you spend: fuel and groceries, or flights and dining.", {"space_after": 14}),
    ("Comparison sites rank by editorial order or sponsorship, not by your spending.", {"space_after": 14}),
    ("Doing the maths by hand for every card is why most people just pick the one a bank executive suggests.", {}),
], size=18, name="background")
for i, (num, lab) in enumerate([("64", "real Indian cards"), ("15", "issuers"), ("13", "spending categories")]):
    y = 1.75 + i * 1.65
    card(s, 7.9, y, 4.85, 1.45, PANEL, 0.08, f"stat card {i + 1}")
    text(s, 8.2, y + 0.2, 1.9, 1.05, num, size=54, face=HEAD, bold=True, color=EMBER, anchor=MSO_ANCHOR.MIDDLE, name=f"stat {i + 1}")
    text(s, 10.2, y + 0.2, 2.4, 1.05, lab, size=18, color=TEXT, anchor=MSO_ANCHOR.MIDDLE, name=f"stat label {i + 1}")

# =============================================================== 3 problem + solution
s = content_slide("1  Introduction", "From spending profile to five ranked cards",
                  "Rishi: State the problem, then the solution. Three ways to describe your spending go in, one ranked, explained list of five cards comes out, "
                  "and you swipe right to shortlist.")
text(s, MX, 1.7, 5.4, 1.3, [("Problem", {"size": 13, "color": EMBER, "bold": True, "space_after": 4}),
                           "No quick, unbiased way for a buyer to learn which card suits their own spending."], size=17, name="problem")
text(s, MX, 3.0, 5.4, 1.5, [("Solution", {"size": 13, "color": EMBER, "bold": True, "space_after": 4}),
                           "Reduce any input to yearly spend per category, score every eligible card on net benefit, return the best five with reasons."], size=17, name="solution")
text(s, MX, 4.75, 5.4, 1.9, [("Filters the user controls", {"size": 13, "color": EMBER, "bold": True, "space_after": 4}),
                            "Exclude banks, cap the annual fee, require lounge access, set income and CIBIL."], size=17, name="filters")
steps = [("Input", "Statement (PDF/CSV), sliders, or logged expenses"), ("Engine", "Rewards, caps, milestones, fees, weighted score"),
         ("Result", "Top 5 with reasoning, chart and breakeven"), ("Swipe", "Left to pass, right to shortlist and compare")]
for i, (h, d) in enumerate(steps):
    y = 1.7 + i * 1.28
    card(s, 6.6, y, 6.15, 1.12, PANEL, 0.1, f"step card {i + 1}")
    pill(s, 6.85, y + 0.31, 0.5, 0.5, str(i + 1), size=16)
    text(s, 7.6, y + 0.14, 4.9, 0.4, h, size=18, bold=True, face=HEAD, name=f"step title {i + 1}")
    text(s, 7.6, y + 0.57, 4.95, 0.45, d, size=14, color=MUTED, name=f"step text {i + 1}")

# =============================================================== 4 objectives and scope
s = content_slide("1  Introduction", "Objectives and scope",
                  "Rishi: Six objectives. Note what is out of scope: OCR for scanned statements, live bank integration, and cloud deployment.")
objs = [("Pure MERN", "MongoDB, Express, React, Node with a clean client, API and database split"),
        ("Spend to categories", "Statement, sliders or expenses become yearly spend across 13 categories"),
        ("Rank 64 cards", "Net annual benefit with caps, milestones and fees applied correctly"),
        ("Real CRUD", "Expenses and shortlist behind JWT auth, ownership checked on every query"),
        ("Preferences", "Exclude banks, fee cap, lounge, compare three cards, export card image"),
        ("Trustworthy", "Validated input, clear errors, 30 automated tests")]
for i, (h, d) in enumerate(objs):
    x, y = MX + (i % 3) * 4.1, 1.7 + (i // 3) * 1.95
    card(s, x, y, 3.9, 1.75, PANEL, 0.07, f"objective {i + 1}")
    text(s, x + 0.25, y + 0.2, 3.4, 0.4, h, size=19, bold=True, face=HEAD, color=EMBER, name=f"objective title {i + 1}")
    text(s, x + 0.25, y + 0.68, 3.4, 1.0, d, size=14, color=TEXT, name=f"objective text {i + 1}")
text(s, MX, 5.75, 6.0, 1.1, [("In scope", {"size": 13, "color": VERD, "bold": True, "space_after": 3}),
                            "Web client, REST API, data model, PDF/CSV parsing, engine, tests"], size=15, name="in scope")
text(s, 6.9, 5.75, 5.9, 1.1, [("Out of scope", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
                             "Scanned-PDF OCR, bank integrations, applications or payments, cloud deployment"], size=15, name="out of scope")

# =============================================================== 5 requirements
s = content_slide("2  Requirements", "What the system does",
                  "Jeh: Eight functional requirements. Guests can do almost everything; signing in adds saved expenses and a shortlist that follows you across devices.")
frs = [("FR1", "Accounts", "Register, sign in, JWT. Guests welcome."), ("FR2", "Card directory", "Search, filter, sort 64 cards."),
       ("FR3", "Statement analysis", "PDF/CSV up to 10 MB, 13 categories."), ("FR4", "Estimated spend", "Sliders or a swipe quiz."),
       ("FR5", "Expense tracker", "Add, view, edit, delete: full CRUD."), ("FR6", "Ranked top 5", "Net benefit, rate, breakeven, reasons."),
       ("FR7", "Shortlist & compare", "Swipe deck, notes, compare three."), ("FR8", "Catalogue admin", "Admin-only create, update, soft delete.")]
for i, (code, h, d) in enumerate(frs):
    x, y = MX + (i % 4) * 3.07, 1.7 + (i // 4) * 2.1
    card(s, x, y, 2.9, 1.9, PANEL, 0.07, f"requirement {code}")
    text(s, x + 0.22, y + 0.2, 1.2, 0.3, code, size=13, bold=True, color=EMBER, name=f"{code} id")
    text(s, x + 0.22, y + 0.55, 2.5, 0.4, h, size=18, bold=True, face=HEAD, name=f"{code} title")
    text(s, x + 0.22, y + 1.05, 2.5, 0.8, d, size=14, color=MUTED, name=f"{code} text")
text(s, MX, 6.05, 12.1, 0.8, "Non-functional: responsive UI, bcrypt + JWT, helmet, rate limiting, in-memory uploads, zod validation, ownership checks, central error handling.",
     size=15, color=MUTED, name="nfr")

# =============================================================== 6 stack
s = content_slide("2  Technology stack", "MongoDB, Express, React, Node",
                  "Rishi: One slide for the stack. Mongo stores everything, Express and Node host the API and the engine, React with Vite is the client. "
                  "Tests run on an in-memory Mongo so they never touch real data.")
cols = [("M", "MongoDB", "Mongoose ODM", ["7 collections", "Indexes on user, date, name", "Unique (user, card)", "Seeded with 64 cards"]),
        ("E", "Express.js", "REST API", ["zod validation", "JWT + bcrypt", "helmet, cors, rate limit", "multer in-memory uploads"]),
        ("R", "React 18", "Vite, TypeScript", ["react-router, Zustand", "Tailwind, Framer Motion", "Recharts, Axios", "html-to-image export"]),
        ("N", "Node.js 18+", "Services", ["Statement parser", "Categoriser", "Recommendation engine", "node:test + supertest"])]
for i, (letter, h, sub, items) in enumerate(cols):
    x = MX + i * 3.07
    card(s, x, 1.7, 2.9, 4.85, PANEL, 0.06, f"stack card {h}")
    pill(s, x + 0.25, 1.95, 0.7, 0.7, letter, size=24)
    text(s, x + 0.25, 2.9, 2.5, 0.46, h, size=21, bold=True, face=HEAD, name=f"{h} title")
    text(s, x + 0.25, 3.35, 2.5, 0.3, sub, size=14, color=VERD, name=f"{h} subtitle")
    text(s, x + 0.25, 3.9, 2.5, 2.5, items, size=15, space_after=8, name=f"{h} items")

# =============================================================== 7 architecture
s = content_slide("3  System design", "Three tiers, one request path",
                  "Jeh: Walk the arrow. The client sends JSON to Express; Express validates, authenticates, and talks to Mongo through Mongoose. "
                  "Statement files are parsed in memory and discarded.")
card(s, MX, 1.65, 8.1, 5.1, "FFFFFF", 0.03, "diagram panel")
pic(s, f"{FIGS}/fig1_architecture.png", MX + 0.15, 1.8, 7.8, 4.8, "architecture diagram")
text(s, 9.1, 1.75, 3.65, 5.0, [
    ("Dev proxy", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
    ("Vite proxies /api to Express, so no CORS setup in development.", {"space_after": 16}),
    ("Privacy", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
    ("Uploads live in memory only. Only the extracted transactions are stored.", {"space_after": 16}),
    ("Guests or users", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
    ("Optional auth on upload and recommend; required auth on expenses and shortlist.", {}),
], size=16, name="architecture notes")

# =============================================================== 8 workflow
s = content_slide("3  System design", "Workflow: input to decision",
                  "Rishi: Eight steps. Input, parse and categorise, annualise, filter, score, rank, swipe, decide. A one-month statement is scaled to twelve months before scoring.")
card(s, MX, 1.65, 12.13, 4.55, "FFFFFF", 0.03, "diagram panel")
pic(s, f"{FIGS}/fig3_workflow.png", MX + 0.2, 1.8, 11.7, 4.25, "workflow diagram")
text(s, MX, 6.4, 12.1, 0.5, "Statements are scaled to a 12-month figure from the span of their dates, so monthly statements and yearly slider estimates compare fairly.",
     size=15, color=MUTED, name="workflow note")

# =============================================================== 9 database
s = content_slide("3  System design", "Seven collections, clear references",
                  "Jeh: Users own expenses, statements and saved cards. Statements embed their category totals because they are read together; "
                  "transactions are separate because there can be hundreds. Saved cards have a unique index so saving twice is harmless.")
card(s, MX, 1.65, 7.7, 5.1, "FFFFFF", 0.03, "diagram panel")
pic(s, f"{FIGS}/fig4_schema.png", MX + 0.12, 1.8, 7.46, 4.8, "schema diagram")
text(s, 8.65, 1.75, 4.1, 5.0, [
    ("users", {"bold": True, "color": EMBER, "space_after": 0}), ("accounts and roles, hash never returned", {"size": 14, "color": MUTED, "space_after": 8}),
    ("cards", {"bold": True, "color": EMBER, "space_after": 0}), ("64-card catalogue the engine scores", {"size": 14, "color": MUTED, "space_after": 8}),
    ("statements + transactions", {"bold": True, "color": EMBER, "space_after": 0}), ("analysed uploads and their rows", {"size": 14, "color": MUTED, "space_after": 8}),
    ("expenses", {"bold": True, "color": EMBER, "space_after": 0}), ("manual spending, one owner", {"size": 14, "color": MUTED, "space_after": 8}),
    ("savedcards", {"bold": True, "color": EMBER, "space_after": 0}), ("shortlist, unique per user and card", {"size": 14, "color": MUTED, "space_after": 8}),
    ("recommendations", {"bold": True, "color": EMBER, "space_after": 0}), ("top pick of each run, as history", {"size": 14, "color": MUTED}),
], size=16, name="collections")

# =============================================================== 10 API
s = content_slide("3  System design", "REST API under /api",
                  "Rishi: Twenty-five routes. Public ones for cards and recommendations, authenticated ones for expenses and the shortlist, admin-only for the catalogue. "
                  "Every error is a JSON object with an error message and a sensible status code.")
rows = [("Auth", "POST /auth/register   POST /auth/login   GET /auth/me", "public / user"),
        ("Cards", "GET /cards   GET /cards/issuers   GET /cards/:id", "public"),
        ("Cards (admin)", "POST /cards   PUT /cards/:id   DELETE /cards/:id", "admin"),
        ("Statements", "POST /statements   GET /statements(/:id)   DELETE /statements/:id", "optional / user"),
        ("Expenses", "POST   GET   GET /summary   PUT /:id   DELETE /:id", "user"),
        ("Saved cards", "POST   GET   PUT /:id (note)   DELETE /:id", "user"),
        ("Recommend", "POST /recommendations   GET /recommendations/history", "optional / user")]
y0 = 1.7
for i, (a_, b_, c_) in enumerate(rows):
    y = y0 + i * 0.72
    card(s, MX, y, 12.13, 0.62, PANEL if i % 2 == 0 else PANEL2, 0.15, f"api row {i + 1}")
    text(s, MX + 0.25, y + 0.12, 2.1, 0.4, a_, size=16, bold=True, face=HEAD, color=EMBER, name=f"api group {i + 1}")
    text(s, MX + 2.5, y + 0.14, 7.2, 0.4, b_, size=14, name=f"api routes {i + 1}")
    text(s, MX + 9.9, y + 0.14, 2.0, 0.4, c_, size=13, color=VERD, align=PP_ALIGN.RIGHT, name=f"api access {i + 1}")

# =============================================================== 11 engine
s = content_slide("4  Implementation", "How a card is scored",
                  "Jeh: Two steps. First, rewards: take the better of the base rate and the category boost, then apply caps. Then the weighted score: forty percent net benefit, "
                  "thirty category fit, twenty premium features, ten low fee. We fixed inflated numbers by enforcing caps, a two percent base ceiling and a partner share.")
text(s, MX, 1.7, 6.5, 5.1, [
    ("1  Reward per category", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
    ("Better of base rate and the card's multiplier or cashback, then capped: category cap, else monthly cap x 12, else Rs 2,000/month above base.", {"space_after": 14}),
    ("2  Honest assumptions", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
    ("Ordinary spend earns at most 2%. Boosts tied to partner merchants apply to 25% of a category. Milestones count once.", {"space_after": 14}),
    ("3  Net benefit and score", {"size": 13, "color": EMBER, "bold": True, "space_after": 3}),
    ("Net = rewards minus annual fee, expressed as a percent of yearly spend so it shares the 0-100 scale of the other weights.", {}),
], size=16, name="engine steps")
cd = CategoryChartData()
cd.categories = ["Net benefit", "Category fit", "Premium features", "Low fee"]
cd.add_series("Weight %", (40, 30, 20, 10))
gf = s.shapes.add_chart(XL_CHART_TYPE.DOUGHNUT, Inches(7.4), Inches(1.7), Inches(5.35), Inches(4.9), cd)
gf.name = "score weights chart"
ch = gf.chart
ch.has_legend = True
ch.legend.position = XL_LEGEND_POSITION.BOTTOM
ch.legend.include_in_layout = False
ch.legend.font.size, ch.legend.font.color.rgb, ch.legend.font.name = Pt(14), rgb(TEXT), BODY
ch.has_title = True
ch.chart_title.text_frame.text = "Score weights"
tr = ch.chart_title.text_frame.paragraphs[0].runs[0]
tr.font.size, tr.font.bold, tr.font.color.rgb, tr.font.name = Pt(16), True, rgb(TEXT), BODY
plot = ch.plots[0]
plot.has_data_labels = True
dl = plot.data_labels
dl.number_format, dl.number_format_is_linked = '0"%"', False
dl.font.size, dl.font.bold, dl.font.color.rgb, dl.font.name = Pt(16), True, rgb(INK), BODY
for idx, col in enumerate([EMBER, VERD, "E8C27A", "B4AB9C"]):
    pt = plot.series[0].points[idx]
    pt.format.fill.solid()
    pt.format.fill.fore_color.rgb = rgb(col)

# =============================================================== 12 UI 1
s = content_slide("4  Implementation", "Interface: landing, dashboard, directory",
                  "Rishi: The product is dark with a single ember accent. Landing explains the name, the dashboard takes input and shows the ranked results, "
                  "and the directory lets you search and filter every card.")
shots = [("ui_landing.png", "Landing"), ("ui_dashboard.png", "Dashboard"), ("ui_cards.png", "Card directory")]
for i, (f, lab) in enumerate(shots):
    x = MX + i * 4.1
    card(s, x, 1.7, 3.95, 4.55, PANEL, 0.04, f"shot card {lab}")
    pic(s, f"{FIGS}/{f}", x + 0.1, 1.8, 3.75, 3.95, f"screenshot {lab}")
    text(s, x + 0.15, 5.78, 3.6, 0.35, lab, size=15, bold=True, align=PP_ALIGN.CENTER, name=f"caption {lab}")
text(s, MX, 6.4, 12.1, 0.5, "React 18 + Vite, react-router, Zustand stores for auth and the shortlist, Tailwind and Framer Motion.", size=15, color=MUTED, name="ui note")

# =============================================================== 13 UI 2
s = content_slide("4  Implementation", "Results, swipe deck and expense tracker",
                  "Jeh: After a request you see the best match with its yearly net benefit, a spend chart and the swipe deck. "
                  "Signed-in users also get an expense tracker whose last twelve months can be ranked directly.")
for i, (f, lab) in enumerate([("ui_dashboard_deck.png", "Best match and swipe deck"), ("ui_expenses.png", "Expense tracker")]):
    x = MX + i * 6.15
    card(s, x, 1.7, 5.98, 4.7, PANEL, 0.04, f"shot card {lab}")
    pic(s, f"{FIGS}/{f}", x + 0.12, 1.82, 5.74, 3.75, f"screenshot {lab}")
    text(s, x + 0.2, 5.75, 5.6, 0.35, lab, size=15, bold=True, align=PP_ALIGN.CENTER, name=f"caption {lab}")
text(s, MX, 6.55, 12.1, 0.4, "Swipe right shortlists a card, left passes. The winning card can be downloaded as an image.", size=15, color=MUTED, name="ui note 2")

# =============================================================== 14 CRUD + validation
s = content_slide("4  Implementation", "CRUD, validation and error handling",
                  "Rishi: The expense tracker is the main CRUD resource. Every query filters by the user from the JWT, so another user's id simply returns 404. "
                  "Validation is layered: zod on the request, Mongoose on the document, and a central error handler.")
crud = [("Create", "Add expense form", "POST /expenses, zod, Expense.create"), ("Read", "List, filter, totals", "GET /expenses, 12-month aggregation"),
        ("Update", "Edit row in form", "PUT /expenses/:id, owner-filtered"), ("Delete", "Trash icon", "DELETE /expenses/:id, 404 if not yours")]
for i, (h, ui, be) in enumerate(crud):
    y = 1.7 + i * 0.95
    card(s, MX, y, 7.2, 0.82, PANEL, 0.12, f"crud row {h}")
    text(s, MX + 0.25, y + 0.22, 1.1, 0.4, h, size=18, bold=True, face=HEAD, color=EMBER, name=f"crud {h}")
    text(s, MX + 1.5, y + 0.15, 2.1, 0.6, ui, size=14, color=MUTED, name=f"crud ui {h}")
    text(s, MX + 3.7, y + 0.15, 3.4, 0.6, be, size=14, name=f"crud api {h}")
text(s, MX, 5.6, 7.2, 1.2, "The saved-card shortlist follows the same pattern: upsert, update note, delete.", size=15, color=MUTED, name="crud note")
text(s, 8.2, 1.7, 4.55, 5.0, [
    ("Errors the user sees", {"size": 13, "color": EMBER, "bold": True, "space_after": 6}),
    ("400  negative amount, bad input", {"space_after": 8}),
    ("401  wrong password, no token", {"space_after": 8}),
    ("404  another user's record", {"space_after": 8}),
    ("409  email already registered", {"space_after": 8}),
    ("413  file over 10 MB", {"space_after": 8}),
    ("422  statement with no transactions", {"space_after": 8}),
], size=17, name="error list")

# =============================================================== 15 testing
s = content_slide("5  Testing and results", "30 tests, 30 passing",
                  "Jeh: Fifteen integration tests run the real Express app against an in-memory MongoDB, and fifteen unit tests cover parsing and the reward maths. "
                  "Finding a 16 percent effective rate in one of them is what led to the base-earn ceiling and the partner share.")
card(s, MX, 1.65, 7.4, 5.15, "0F1117", 0.02, "test panel")
pic(s, f"{FIGS}/ev_tests.png", MX + 0.1, 1.75, 7.2, 4.95, "test output")
for i, (num, lab) in enumerate([("30/30", "tests pass"), ("15", "API and integration"), ("15", "unit tests")]):
    y = 1.65 + i * 1.75
    card(s, 8.3, y, 4.45, 1.55, PANEL, 0.08, f"result card {i + 1}")
    text(s, 8.55, y + 0.2, 2.1, 1.15, num, size=40, face=HEAD, bold=True, color=EMBER, anchor=MSO_ANCHOR.MIDDLE, name=f"result {i + 1}")
    text(s, 10.65, y + 0.2, 2.0, 1.15, lab, size=16, anchor=MSO_ANCHOR.MIDDLE, name=f"result label {i + 1}")

# =============================================================== 16 verification
s = content_slide("5  Testing and results", "Live API checks",
                  "Rishi: Real requests to the running server. A catalogue search, a ranking whose top results sit at two to four percent effective rate, "
                  "and three failure cases with the right status codes.")
card(s, MX, 1.65, 7.6, 5.15, "0F1117", 0.02, "api panel")
pic(s, f"{FIGS}/ev_api.png", MX + 0.1, 1.75, 7.4, 4.95, "api evidence")
text(s, 8.6, 1.75, 4.15, 5.0, [
    ("What was checked", {"size": 13, "color": EMBER, "bold": True, "space_after": 6}),
    ("Search and filters return correct cards", {"space_after": 10}),
    ("Top-3 ranking at realistic reward rates", {"space_after": 10}),
    ("Invalid input returns 400 with a message", {"space_after": 10}),
    ("Wrong password and missing token return 401", {"space_after": 10}),
    ("Postman and Compass were not used", {"color": MUTED, "size": 14}),
], size=17, name="verification notes")

# =============================================================== 17 challenges
s = content_slide("7  Challenges", "Problems we hit and how we fixed them",
                  "Jeh: Five real problems. Inflated rewards were the big one, so most of the engine work went into caps and assumptions. "
                  "PDF parsing needed paise-aware amounts and ordinal dates. CSV direction needed Dr/Cr handling.")
ch_rows = [("Inflated rewards", "Enforced caps, 2% base ceiling, partner share, percent-of-spend scoring"),
           ("PDF gave 0 or wrong rows", "Amounts need paise, ordinal and month-name dates, first amount on a line"),
           ("Salary counted as spend", "Dr/Cr columns, suffixes and signs decide direction; debits only"),
           ("Monthly vs yearly", "Scale statement totals to 12 months by date span"),
           ("Setup failures", "Single MongoDB URI, auto-seeded catalogue, optional accounts")]
for i, (h, d) in enumerate(ch_rows):
    y = 1.7 + i * 1.0
    card(s, MX, y, 12.13, 0.88, PANEL if i % 2 == 0 else PANEL2, 0.12, f"challenge row {i + 1}")
    text(s, MX + 0.3, y + 0.22, 3.6, 0.5, h, size=18, bold=True, face=HEAD, color=EMBER, name=f"challenge {i + 1}")
    text(s, MX + 4.1, y + 0.22, 7.8, 0.55, d, size=15, name=f"fix {i + 1}")

# =============================================================== 18 repo + contributions
s = content_slide("6-7  GitHub and team", "Repository, deployment and who built what",
                  "Rishi: The MERN edition is under the mern folder with its own server and client package files. It runs locally; it is not deployed, "
                  "and the connection string means Atlas can be used without code changes.")
card(s, MX, 1.7, 5.0, 4.95, "FFFFFF", 0.03, "repo panel")
pic(s, f"{FIGS}/fig_repo.png", MX + 0.1, 1.8, 4.8, 4.75, "repository layout")
text(s, 5.95, 1.75, 6.8, 0.4, REPO, size=16, bold=True, color=VERD, name="repo url")
text(s, 5.95, 2.25, 6.8, 0.9, "Deployment: not deployed (N.A.). Runs locally; MONGODB_URI can point at MongoDB Atlas.", size=15, color=MUTED, name="deployment")
for i, (nm, roll, work) in enumerate([
        ("Jeh Dadina", "16010124038", "Landing, dashboard, swipe deck; recommendation engine, statement parser, categoriser; card models and seed; engine and parser tests"),
        ("Rishi Dadia", "16010124037", "Directory, compare, saved, expenses and auth pages; auth, expense and shortlist routes; user models; API tests, report")]):
    y = 3.4 + i * 1.7
    card(s, 5.95, y, 6.8, 1.5, PANEL, 0.07, f"contribution {nm}")
    text(s, 6.2, y + 0.15, 6.3, 0.35, f"{nm}  |  {roll}", size=16, bold=True, face=HEAD, color=EMBER, name=f"name {nm}")
    text(s, 6.2, y + 0.58, 6.35, 0.85, work, size=13, color=TEXT, name=f"work {nm}")

# =============================================================== 19 conclusion
s = content_slide("8  Conclusion", "Conclusion and future scope",
                  "Jeh: Close on what we built and what is next. Then hand over to questions.")
text(s, MX, 1.7, 5.8, 0.4, "What we delivered", size=20, bold=True, face=HEAD, color=EMBER, name="delivered title")
text(s, MX, 2.3, 5.8, 4.4, [
    "A MERN app that turns spending into five ranked, explained card matches.",
    "64 cards, 13 categories, caps, milestones and fees applied.",
    "JWT accounts, full CRUD with ownership checks, validated errors.",
    "30 passing automated tests and a scripted browser walkthrough.",
], size=17, space_after=12, name="delivered")
text(s, 6.9, 1.7, 5.8, 0.4, "What comes next", size=20, bold=True, face=HEAD, color=EMBER, name="next title")
text(s, 6.9, 2.3, 5.85, 4.4, [
    "Deploy: Atlas, a Node host, CI that runs the tests.",
    "Account Aggregator or OCR instead of manual uploads.",
    "Trained categoriser; base rates and partner shares as data.",
    "Admin console and front-end end-to-end tests.",
], size=17, space_after=12, name="next")

# =============================================================== 20 thanks
s = prs.slides.add_slide(BLANK)
bg(s)
pic(s, "../../mern/client/public/logo.png", MX, 0.6, 3.2, 0.7, "logo")
text(s, MX, 2.6, 11, 1.4, "Thank you", size=66, face=HEAD, bold=True, name="title")
text(s, MX, 4.1, 9, 0.6, "Questions?", size=28, color=EMBER, name="subtitle")
text(s, MX, 5.4, 9, 1.0, ["Jeh Dadina 16010124038   |   Rishi Dadia 16010124037", REPO], size=16, color=MUTED, name="contacts")
s.notes_slide.notes_text_frame.text = "Both: Thank the panel and take questions. Likely questions: why a 2% base ceiling, how statements are scaled to a year, and how ownership is enforced."

prs.save(OUT)
print("saved", OUT, len(prs.slides), "slides")
print("\n".join(problems) if problems else "text fit: all boxes OK")
