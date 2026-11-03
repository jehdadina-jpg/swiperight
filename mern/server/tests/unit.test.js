import { test } from "node:test";
import assert from "node:assert/strict";
import { categorize, categoryTotals } from "../src/services/categorizer.js";
import { parseCsvText, parseDate, parseStatementText, periodDaysOf } from "../src/services/statementParser.js";
import { categoryReward, scoreCard, BASE_EARN_CEILING, DEFAULT_MONTHLY_BONUS_CAP, PARTNER_SHARE } from "../src/services/recommendationEngine.js";

const card = (over = {}) => ({
  name: "Test Card", issuer: "Test Bank", rewardRate: 1, annualFee: 0, tags: [], rewardCaps: {},
  diningBenefits: {}, travelBenefits: {}, shoppingBenefits: {}, fuelBenefits: {}, otherBenefits: {}, milestones: {},
  loungeAccess: false, ...over,
});

test("categorizer: merchants map to the right category", () => {
  assert.equal(categorize("SWIGGY ORDER 4821").category, "Dining");
  assert.equal(categorize("IRCTC TICKET").category, "Travel");
  assert.equal(categorize("HP PETROL PUMP").category, "Fuel");
  assert.equal(categorize("BLINKIT").category, "Groceries");
  assert.equal(categorize("Amazon Prime membership").category, "Subscriptions");
  assert.equal(categorize("random shop xyz").category, "Others");
});

test("categorizer: short tokens are word-bounded", () => {
  assert.notEqual(categorize("Solar panel installer").category, "Travel");
  assert.notEqual(categorize("Barista Lounge").category, "Dining");
});

test("parseDate: Indian day-first formats and month names", () => {
  assert.equal(parseDate("05/03/2024").toISOString().slice(0, 10), "2024-03-05");
  assert.equal(parseDate("5-3-24").toISOString().slice(0, 10), "2024-03-05");
  assert.equal(parseDate("1st November 2018").toISOString().slice(0, 10), "2018-11-01");
  assert.equal(parseDate("31/02/2024"), null);
  assert.equal(parseDate("not a date"), null);
});

test("CSV parser: debit/credit columns and Dr/Cr type column", () => {
  const csv = [
    "Date,Description,Debit,Credit",
    "01/04/2024,SWIGGY ORDER,450.00,",
    "02/04/2024,SALARY,,50000.00",
    "03/04/2024,IRCTC TICKET,1200.50,",
  ].join("\n");
  const rows = parseCsvText(csv);
  assert.equal(rows.length, 3);
  assert.equal(rows.filter((r) => r.type === "debit").length, 2);
  assert.equal(rows.find((r) => r.type === "credit").amount, 50000);

  const typed = parseCsvText("Date,Narration,Amount,Dr/Cr\n01/04/2024,Refund Amazon,500,Cr\n02/04/2024,Uber ride,250,Dr");
  assert.deepEqual(typed.map((r) => r.type).sort(), ["credit", "debit"]);
});

test("CSV parser: semicolon delimiter and duplicate rows", () => {
  const rows = parseCsvText("Date;Description;Amount\n01/04/2024;Zomato;300.00\n01/04/2024;Zomato;300.00");
  assert.equal(rows.length, 1);
});

test("PDF text parser: picks the first amount, ignores times and running balance", () => {
  const text = "01/04/2024 SWIGGY ORDER 11:22am 450.00 DR 9,550.00\n02/04/2024 SALARY CREDIT 50000.00 CR";
  const rows = parseStatementText(text);
  const swiggy = rows.find((r) => /swiggy/i.test(r.merchant));
  assert.equal(swiggy.amount, 450);
  assert.equal(swiggy.type, "debit");
  assert.equal(rows.find((r) => /salary/i.test(r.merchant)).type, "credit");
});

test("categoryTotals: credits are not counted as spending", () => {
  const { list, spending } = categoryTotals([
    { type: "debit", category: "Dining", amount: 300 },
    { type: "debit", category: "Dining", amount: 200 },
    { type: "credit", category: "Others", amount: 99999 },
  ]);
  assert.equal(spending, 500);
  assert.equal(list[0].percentage, 100);
});

test("periodDaysOf: one month of data spans ~30 days", () => {
  const d = (s) => new Date(s);
  assert.equal(periodDaysOf([{ date: d("2024-04-01") }, { date: d("2024-04-30") }]), 30);
});

test("engine: unlisted bonus category is capped, not unlimited", () => {
  const dining = card({ rewardRate: 1, diningBenefits: { reward_multiplier: 10 } });
  // 10X on 1.5L = 15,000, well under the default ceiling, so it is untouched
  assert.equal(categoryReward(dining, "Dining", 150000), 15000);
  // 10X on 15L would be 1,50,000; ceiling is base (15,000) + 2,000 x 12
  assert.equal(categoryReward(dining, "Dining", 1500000), 15000 + DEFAULT_MONTHLY_BONUS_CAP * 12);
});

test("engine: explicit monthly cap wins over multiplier", () => {
  const c = card({ rewardRate: 1, diningBenefits: { reward_multiplier: 10 }, rewardCaps: { monthly: 500 } });
  assert.equal(categoryReward(c, "Dining", 1000000), 6000);
});

test("engine: fuel cashback replaces base, surcharge waiver adds", () => {
  const c = card({ rewardRate: 1, fuelBenefits: { cashback: 3, surcharge_waiver: "1%" } });
  assert.equal(categoryReward(c, "Fuel", 10000), 300 + 100);
});

test("engine: effective rate excludes milestone bonus; net = rewards - fee", () => {
  const c = card({ rewardRate: 2, annualFee: 1000, milestones: { "100000": 5000 } });
  const { details } = scoreCard(c, { Shopping: 120000 }, 120000);
  assert.equal(details.effectiveRewardRate, 2);
  assert.equal(details.milestoneBonus, 5000);
  assert.equal(details.totalRewards, 2400 + 5000);
  assert.equal(details.netAnnualBenefit, 2400 + 5000 - 1000);
});

test("engine: score stays on a 0-100 scale for ordinary spend", () => {
  const c = card({ rewardRate: 5, annualFee: 500, tags: ["cashback"] });
  const { score } = scoreCard(c, { Bills: 200000 }, 200000);
  assert.ok(score >= 0 && score <= 100, `score ${score}`);
});

test("engine: a headline rate is not applied to every category", () => {
  const swiggy = card({ rewardRate: 10, diningBenefits: { cashback: 10 }, rewardCaps: { monthly: 1500 } });
  // dining uses the card's own 10% cashback (capped at 1,500 a month)...
  assert.equal(categoryReward(swiggy, "Dining", 100000), 10000);
  // ...but plain fuel spend only earns the base ceiling, not the 10% headline
  assert.equal(categoryReward(swiggy, "Fuel", 100000), (100000 * BASE_EARN_CEILING) / 100);
});

test("engine: partner-only boosts apply to a share of the category", () => {
  const select = card({ rewardRate: 2, shoppingBenefits: { reward_multiplier: 10, partners: ["Swiggy"] } });
  const all = card({ rewardRate: 2, shoppingBenefits: { reward_multiplier: 10 } });
  const amount = 60000; // 10X on everything = 12,000
  assert.equal(categoryReward(all, "Shopping", amount), 12000);
  const expected = 12000 * PARTNER_SHARE + 1200 * (1 - PARTNER_SHARE);
  assert.ok(Math.abs(categoryReward(select, "Shopping", amount) - expected) < 0.001);
});
