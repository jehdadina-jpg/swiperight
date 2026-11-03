"""Draws the architecture, workflow and schema figures used in the report and deck."""
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT = "figs"
INK = "#1f2430"
EMBER = "#d9411e"
VERD = "#2f6f5f"
SOFT = {"client": "#fde7df", "server": "#e3efec", "db": "#e8e6f5", "ext": "#f1efe8"}
EDGE = {"client": EMBER, "server": VERD, "db": "#5a4fb0", "ext": "#8a8576"}
plt.rcParams["font.family"] = "DejaVu Sans"


def box(ax, x, y, w, h, title, lines=(), kind="server", title_size=10.5):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.12",
                                fc=SOFT[kind], ec=EDGE[kind], lw=1.6))
    ax.text(x + w / 2, y + h - 0.22, title, ha="center", va="top", fontsize=title_size, fontweight="bold", color=INK)
    for i, line in enumerate(lines):
        ax.text(x + w / 2, y + h - 0.62 - i * 0.3, line, ha="center", va="top", fontsize=8.2, color="#3b4252")


def arrow(ax, p1, p2, label="", color=INK, rad=0.0, label_xy=None, both=False):
    a = FancyArrowPatch(p1, p2, arrowstyle="<|-|>" if both else "-|>", mutation_scale=14, lw=1.4,
                        color=color, connectionstyle=f"arc3,rad={rad}")
    ax.add_patch(a)
    if label:
        lx, ly = label_xy or ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 0.18)
        ax.text(lx, ly, label, ha="center", va="bottom", fontsize=8, color=color,
                bbox=dict(fc="white", ec="none", pad=1.2))


def canvas(w, h):
    fig, ax = plt.subplots(figsize=(w, h))
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.axis("off")
    return fig, ax


def architecture():
    fig, ax = canvas(12, 6.2)
    box(ax, 0.3, 1.0, 3.0, 4.2, "React client (Vite)",
        ["Pages: Landing, Dashboard,", "Cards, Compare, Saved,", "Quiz, Expenses, Auth", "",
         "Zustand stores", "(auth, saved cards)", "Axios + JWT header", "Tailwind, Framer Motion"], "client")
    box(ax, 4.5, 0.4, 3.6, 5.4, "Express.js API (Node)",
        ["helmet · cors · rate-limit", "zod validation", "JWT auth middleware", "",
         "/api/auth       /api/cards", "/api/statements /api/expenses", "/api/saved  /api/recommendations", "",
         "Services:", "statement parser · categoriser", "recommendation engine"], "server")
    box(ax, 9.3, 2.6, 2.4, 2.6, "MongoDB",
        ["Mongoose ODM", "users · cards", "expenses · statements", "transactions", "saved cards", "recommendations"], "db")
    box(ax, 9.3, 0.35, 2.4, 1.6, "File upload", ["PDF / CSV statement", "multer, memory only", "never written to disk"], "ext")

    arrow(ax, (3.3, 3.9), (4.5, 3.9), "HTTP / JSON", EMBER, label_xy=(3.9, 4.1))
    arrow(ax, (4.5, 2.7), (3.3, 2.7), "JSON response", VERD, label_xy=(3.9, 2.45))
    arrow(ax, (8.1, 3.9), (9.3, 3.9), "Mongoose", "#5a4fb0", label_xy=(8.7, 4.1), both=True)
    arrow(ax, (9.3, 1.2), (8.1, 1.7), "multipart", "#8a8576", label_xy=(8.7, 1.1))
    ax.text(6, 5.95, "Request / response path", ha="center", fontsize=10, color="#6b7280", style="italic")
    fig.savefig(f"{OUT}/fig1_architecture.png", dpi=200, bbox_inches="tight", facecolor="white")


def workflow():
    fig, ax = canvas(12, 5.4)
    # input row
    box(ax, 0.2, 3.6, 2.6, 1.4, "1. Choose input", ["Upload PDF / CSV", "Slider estimates", "Logged expenses"], "client")
    box(ax, 3.4, 3.6, 2.6, 1.4, "2. Parse & categorise", ["Date / amount parsing", "13 spend categories", "Debits only counted"], "server")
    box(ax, 6.6, 3.6, 2.6, 1.4, "3. Annualise", ["Scale statement span", "to 12 months", "Total per category"], "server")
    box(ax, 9.4, 3.6, 2.4, 1.4, "4. Filter cards", ["Excluded banks", "Max fee, lounge", "Income / CIBIL"], "server")
    box(ax, 9.4, 0.4, 2.4, 1.6, "5. Score each card", ["Rewards - fees", "Category fit", "Premium, low fee"], "server")
    box(ax, 6.2, 0.4, 2.6, 1.6, "6. Rank top 5", ["Sort by score", "Reasoning text", "Save top pick"], "server")
    box(ax, 3.0, 0.4, 2.6, 1.6, "7. Swipe & shortlist", ["Swipe deck UI", "Save to MongoDB", "Compare up to 3"], "client")
    box(ax, 0.2, 0.4, 2.4, 1.6, "8. Decide", ["Download card image", "Apply with issuer"], "client")
    for a, b in [((2.8, 4.3), (3.4, 4.3)), ((6.0, 4.3), (6.6, 4.3)), ((9.2, 4.3), (9.4, 4.3))]:
        arrow(ax, a, b, color=INK)
    arrow(ax, (10.6, 3.6), (10.6, 2.0), color=INK)
    for a, b in [((9.4, 1.2), (8.8, 1.2)), ((6.2, 1.2), (5.6, 1.2)), ((3.0, 1.2), (2.6, 1.2))]:
        arrow(ax, a, b, color=INK)
    fig.savefig(f"{OUT}/fig3_workflow.png", dpi=200, bbox_inches="tight", facecolor="white")


def schema():
    fig, ax = canvas(12.5, 6.9)

    def coll(x, y, w, name, fields):
        h = 0.62 + 0.27 * len(fields)
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.02,rounding_size=0.08", fc="white", ec=EDGE["db"], lw=1.6))
        ax.add_patch(FancyBboxPatch((x, y + h - 0.42), w, 0.42, boxstyle="round,pad=0.02,rounding_size=0.08", fc=EDGE["db"], ec=EDGE["db"]))
        ax.text(x + w / 2, y + h - 0.21, name, ha="center", va="center", color="white", fontsize=10, fontweight="bold")
        for i, f in enumerate(fields):
            ax.text(x + 0.14, y + h - 0.72 - i * 0.27, f, fontsize=7.6, va="center", color=INK, family="DejaVu Sans Mono")

    top, bot = 4.1, 0.35
    coll(0.3, top, 3.2, "users", ["_id", "email (unique)", "fullName", "passwordHash", "role  user | admin", "createdAt"])
    coll(4.7, top, 3.4, "statements", ["_id", "user -> users (optional)", "fileName, fileType", "periodDays", "totalSpending", "categoryTotals[]"])
    coll(9.0, top, 3.2, "transactions", ["_id", "statement -> statements", "date, merchant", "amount, type", "category, confidence"])
    coll(0.3, bot, 3.2, "expenses", ["_id", "user -> users", "merchant", "amount", "category (13 values)", "date, note"])
    coll(4.7, bot, 3.4, "savedcards", ["_id", "user -> users", "card -> cards", "note", "unique(user, card)"])
    coll(9.0, bot, 3.2, "cards", ["_id", "name, issuer, network", "annualFee, joiningFee", "rewardRate", "rewardCaps, milestones", "dining/travel/fuel/", "  shopping/otherBenefits", "loungeAccess, tags[]", "minIncome, minCibil", "churnRisk, isActive"])

    def link(p1, p2, label="1 : N", lxy=None):
        arrow(ax, p1, p2, label, "#6b7280", label_xy=lxy)

    link((3.5, top + 1.2), (4.7, top + 1.2), "1 : N", (4.1, top + 1.35))        # users -> statements
    link((8.1, top + 1.2), (9.0, top + 1.2), "1 : N", (8.55, top + 1.35))       # statements -> transactions
    link((1.9, top), (1.9, bot + 2.3), "1 : N", (2.3, 3.45))                     # users -> expenses
    link((3.2, top), (4.9, bot + 2.0), "1 : N", (3.5, 3.35))                     # users -> savedcards
    link((9.0, bot + 1.0), (8.1, bot + 1.0), "1 : N", (8.55, bot + 1.15))        # cards -> savedcards
    ax.text(6.25, 6.65, "MongoDB collections and references", ha="center", fontsize=11, fontweight="bold", color=INK)
    fig.savefig(f"{OUT}/fig4_schema.png", dpi=200, bbox_inches="tight", facecolor="white")


if __name__ == "__main__":
    import os
    os.makedirs(OUT, exist_ok=True)
    architecture()
    workflow()
    schema()
    print("diagrams written")
