// Rule-based transaction categoriser. Each category owns a list of merchant /
// keyword patterns; the first category with a matching pattern wins.

export const CATEGORIES = [
  "Dining",
  "Travel",
  "Fuel",
  "Shopping",
  "Utilities",
  "Subscriptions",
  "Healthcare",
  "Entertainment",
  "Education",
  "Bills",
  "Investments",
  "Groceries",
  "Others",
];

// Short, ambiguous tokens (bar, ola, bus, more...) are word-bounded so
// "barista" is not Dining-by-"bar" and "solar" is not Travel-by-"ola".
const RULES = {
  Dining: [
    /swiggy(?!\s*instamart)/, /zomato/, /uber\s*eats/, /restaurant/, /cafe/, /\bfood/, /domino/,
    /mcdonald/, /\bkfc\b/, /pizza/, /burger/, /biryani/, /dunkin/, /starbucks/, /coffee/,
    /\bbar\b/, /\bpub\b/, /\bdine/,
  ],
  Travel: [
    /irctc/, /makemytrip/, /goibibo/, /yatra/, /cleartrip/, /\buber\b/, /\bola\b/, /rapido/,
    /flight/, /airline/, /indigo/, /spicejet/, /air\s*india/, /vistara/, /hotel/, /resort/,
    /\boyo\b/, /treebo/, /\btrain\b/, /\bbus\b/, /redbus/, /abhibus/,
  ],
  Fuel: [
    /petrol/, /diesel/, /\bfuel/, /hp\s*petrol/, /bharat\s*petroleum/, /indian\s*oil/, /\bshell\b/,
    /reliance\s*petrol/, /essar/, /bpcl/, /hpcl/, /iocl/, /\bcng\b/, /gas\s*station/,
  ],
  Groceries: [
    /bigbasket/, /grofers/, /blinkit/, /zepto/, /dunzo/, /swiggy\s*instamart/, /grocer/,
    /supermarket/, /reliance\s*fresh/, /dmart/, /\bmore\b/, /spencer/, /nature.*basket/,
    /vegetable/, /\bfruit/, /\bmilk\b/, /\bbread\b/,
  ],
  Shopping: [
    /amazon(?!\s*prime)/, /flipkart/, /myntra/, /ajio/, /meesho/, /snapdeal/, /tata\s*cliq/, /nykaa/,
    /shopping/, /\bmall\b/, /\bstore\b/, /retail/, /fashion/, /clothing/, /apparel/, /shoes/,
    /electronics/, /\bmobile\b(?!\s*recharge)/, /laptop/,
  ],
  Utilities: [
    /electricity/, /\bwater\b/, /gas\s*bill/, /broadband/, /internet/, /mobile\s*recharge/, /airtel/,
    /\bjio\b/, /vodafone/, /bsnl/, /phone\s*bill/, /postpaid/, /utility/, /municipal/,
  ],
  Subscriptions: [
    /netflix/, /prime\s*video/, /amazon\s*prime/, /hotstar/, /disney/, /zee5/, /sony\s*liv/, /spotify/,
    /youtube\s*premium/, /apple\s*music/, /subscription/, /membership/, /\bgym\b/, /fitness/, /cult.*fit/,
  ],
  Healthcare: [
    /hospital/, /clinic/, /doctor/, /pharmacy/, /medical/, /apollo/, /medplus/, /netmeds/, /pharmeasy/,
    /health/, /medicine/, /diagnostic/, /\blab\b/, /pathology/,
  ],
  Entertainment: [
    /bookmyshow/, /paytm\s*insider/, /movie/, /cinema/, /\bpvr\b/, /\binox\b/, /theatre/, /concert/,
    /\bevent/, /ticket/, /\bgame/, /steam/, /playstation/, /xbox/, /nintendo/,
  ],
  Education: [
    /school/, /college/, /universit/, /tuition/, /\bcourse/, /udemy/, /coursera/, /unacademy/, /byjus/,
    /vedantu/, /education/, /training/, /learning/, /\bbook\b/, /stationery/,
  ],
  Bills: [
    /bill\s*payment/, /insurance/, /\bemi\b/, /\bloan\b/, /credit\s*card/, /\btax\b/, /\brent\b/,
    /maintenance/, /society/, /challan/,
  ],
  Investments: [
    /mutual\s*fund/, /\bsip\b/, /\bstock/, /\bshare\b/, /zerodha/, /groww/, /upstox/, /angel\s*one/,
    /icicidirect/, /investment/, /demat/, /trading/, /equity/, /\bfd\b/, /fixed\s*deposit/,
  ],
};

const round2 = (n) => Math.round(n * 100) / 100;

export function categorize(merchant = "", description = "") {
  const text = `${merchant} ${description}`.toLowerCase().trim();
  for (const [category, patterns] of Object.entries(RULES)) {
    if (patterns.some((p) => p.test(text))) return { category, confidence: 0.95 };
  }
  return { category: "Others", confidence: 0.3 };
}

export function categorizeBatch(transactions) {
  return transactions.map((t) => {
    const { category, confidence } = categorize(t.merchant || t.normalizedMerchant, t.description);
    return { ...t, category, confidence };
  });
}

// Same merchant, 2+ charges, amounts within 10% of their mean: a subscription.
// Only uncategorised ("Others") rows are re-labelled.
export function detectRecurring(transactions) {
  const groups = new Map();
  for (const t of transactions) {
    const key = t.normalizedMerchant || t.merchant;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  for (const rows of groups.values()) {
    if (rows.length < 2) continue;
    const avg = rows.reduce((s, r) => s + r.amount, 0) / rows.length;
    if (avg > 0 && rows.every((r) => Math.abs(r.amount - avg) / avg < 0.1)) {
      for (const r of rows) {
        if (r.category === "Others") {
          r.category = "Subscriptions";
          r.confidence = 0.85;
        }
      }
    }
  }
  return transactions;
}

export function categoryTotals(transactions) {
  const totals = {};
  let spending = 0;
  for (const t of transactions) {
    if (t.type !== "debit") continue;
    const c = (totals[t.category] ??= { totalAmount: 0, transactionCount: 0 });
    c.totalAmount += t.amount;
    c.transactionCount += 1;
    spending += t.amount;
  }
  const list = Object.entries(totals).map(([category, v]) => ({
    category,
    totalAmount: round2(v.totalAmount),
    transactionCount: v.transactionCount,
    percentage: spending > 0 ? round2((v.totalAmount / spending) * 100) : 0,
  }));
  list.sort((a, b) => b.totalAmount - a.totalAmount);
  return { list, spending: round2(spending) };
}
