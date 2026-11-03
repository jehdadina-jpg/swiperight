import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "test";
const { createApp } = await import("../src/app.js");
const { seedCards } = await import("../src/services/seed.js");

let mongod;
let api;
let token;
let cardId;

const auth = () => ({ Authorization: `Bearer ${token}` });

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri("swiperight_test"));
  await seedCards();
  api = request(createApp());
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test("health reports database connected", async () => {
  const res = await api.get("/api/health").expect(200);
  assert.equal(res.body.database, "connected");
});

test("catalogue is seeded with 64 cards", async () => {
  const res = await api.get("/api/cards?limit=200").expect(200);
  assert.equal(res.body.length, 64);
  cardId = res.body[0].id;
  assert.ok(cardId && res.body[0].annualFee !== undefined);
});

test("cards: search, filter and sort", async () => {
  const hdfc = (await api.get("/api/cards?issuer=HDFC Bank").expect(200)).body;
  assert.ok(hdfc.length > 0 && hdfc.every((c) => c.issuer === "HDFC Bank"));

  const free = (await api.get("/api/cards?maxAnnualFee=0").expect(200)).body;
  assert.ok(free.every((c) => c.annualFee === 0));

  const sorted = (await api.get("/api/cards?sortBy=annualFee&sortDir=asc").expect(200)).body;
  for (let i = 1; i < sorted.length; i++) assert.ok(sorted[i].annualFee >= sorted[i - 1].annualFee);

  const search = (await api.get("/api/cards?search=infinia").expect(200)).body;
  assert.ok(search.length >= 1 && /infinia/i.test(search[0].name));
});

test("cards: bad query is rejected, unknown id is 404", async () => {
  await api.get("/api/cards?sortBy=bogus").expect(400);
  await api.get("/api/cards/not-an-id").expect(404);
  await api.get("/api/cards/64b7f0a2c3d4e5f6a7b8c9d0").expect(404);
});

test("auth: register, duplicate, bad input, login, me", async () => {
  const reg = await api.post("/api/auth/register").send({ email: "Jeh@Example.com", password: "password123", fullName: "Jeh" }).expect(201);
  assert.equal(reg.body.user.email, "jeh@example.com");
  assert.equal(reg.body.user.passwordHash, undefined);
  token = reg.body.token;

  await api.post("/api/auth/register").send({ email: "jeh@example.com", password: "password123" }).expect(409);
  await api.post("/api/auth/register").send({ email: "bad", password: "password123" }).expect(400);
  await api.post("/api/auth/register").send({ email: "x@y.com", password: "short" }).expect(400);

  await api.post("/api/auth/login").send({ email: "jeh@example.com", password: "wrongpass1" }).expect(401);
  const login = await api.post("/api/auth/login").send({ email: "jeh@example.com", password: "password123" }).expect(200);
  assert.ok(login.body.token);

  await api.get("/api/auth/me").set(auth()).expect(200);
  await api.get("/api/auth/me").expect(401);
});

test("expenses: full CRUD with validation and ownership", async () => {
  await api.get("/api/expenses").expect(401);
  await api.post("/api/expenses").set(auth()).send({ merchant: "Swiggy", amount: -5, category: "Dining" }).expect(400);
  await api.post("/api/expenses").set(auth()).send({ merchant: "Swiggy", amount: 500, category: "Nonsense" }).expect(400);

  const created = await api.post("/api/expenses").set(auth()).send({ merchant: "Swiggy", amount: 540, category: "Dining" }).expect(201);
  const id = created.body.id;
  await api.post("/api/expenses").set(auth()).send({ merchant: "HP Petrol", amount: 3000, category: "Fuel" }).expect(201);

  const list = await api.get("/api/expenses").set(auth()).expect(200);
  assert.equal(list.body.length, 2);
  const onlyFuel = await api.get("/api/expenses?category=Fuel").set(auth()).expect(200);
  assert.equal(onlyFuel.body.length, 1);

  const updated = await api.put(`/api/expenses/${id}`).set(auth()).send({ amount: 600 }).expect(200);
  assert.equal(updated.body.amount, 600);
  assert.equal(updated.body.merchant, "Swiggy");

  const summary = await api.get("/api/expenses/summary").set(auth()).expect(200);
  assert.equal(summary.body.total, 3600);

  // another user cannot touch it
  const other = await api.post("/api/auth/register").send({ email: "rishi@example.com", password: "password123" }).expect(201);
  await api.delete(`/api/expenses/${id}`).set({ Authorization: `Bearer ${other.body.token}` }).expect(404);

  await api.delete(`/api/expenses/${id}`).set(auth()).expect(204);
  await api.delete(`/api/expenses/${id}`).set(auth()).expect(404);
  assert.equal((await api.get("/api/expenses").set(auth())).body.length, 1);
});

test("saved cards: add, idempotent add, note update, remove", async () => {
  await api.post("/api/saved").set(auth()).send({ cardId: "nope" }).expect(404);
  const a = await api.post("/api/saved").set(auth()).send({ cardId }).expect(201);
  const b = await api.post("/api/saved").set(auth()).send({ cardId }).expect(201);
  assert.equal(a.body.id, b.body.id);
  assert.equal((await api.get("/api/saved").set(auth())).body.length, 1);

  const noted = await api.put(`/api/saved/${a.body.id}`).set(auth()).send({ note: "Apply in March" }).expect(200);
  assert.equal(noted.body.note, "Apply in March");
  assert.equal(noted.body.card.id, cardId);

  await api.delete(`/api/saved/${a.body.id}`).set(auth()).expect(204);
  assert.equal((await api.get("/api/saved").set(auth())).body.length, 0);
});

test("recommendations: manual spend returns five ranked, sane results", async () => {
  const res = await api
    .post("/api/recommendations")
    .send({ manualCategoryTotals: { Dining: 120000, Travel: 80000, Fuel: 60000, Shopping: 150000 } })
    .expect(200);
  const recs = res.body.recommendations;
  assert.equal(recs.length, 5);
  recs.forEach((r, i) => assert.equal(r.rank, i + 1));
  for (let i = 1; i < recs.length; i++) assert.ok(recs[i - 1].calculationDetails.score >= recs[i].calculationDetails.score);

  for (const r of recs) {
    const d = r.calculationDetails;
    assert.equal(d.yearlySpend, 410000);
    assert.ok(d.effectiveRewardRate <= 15, `effective rate ${d.effectiveRewardRate}% looks inflated`);
    assert.ok(r.confidenceScore >= 0 && r.confidenceScore <= 3, `confidence ${r.confidenceScore}`);
    assert.ok(Math.abs(d.totalRewards - d.annualFee - d.netAnnualBenefit) < 0.02, "net = rewards - fee");
  }
});

test("recommendations: preferences are respected", async () => {
  const base = { manualCategoryTotals: { Dining: 100000, Shopping: 100000 }, topN: 10 };
  const noHdfc = (await api.post("/api/recommendations").send({ ...base, excludedIssuers: ["HDFC Bank"] }).expect(200)).body;
  assert.ok(noHdfc.recommendations.every((r) => r.card.issuer !== "HDFC Bank"));

  const cheap = (await api.post("/api/recommendations").send({ ...base, maxAnnualFee: 1000 }).expect(200)).body;
  assert.ok(cheap.recommendations.every((r) => r.card.annualFee <= 1000));

  const lounge = (await api.post("/api/recommendations").send({ ...base, requireLoungeAccess: true }).expect(200)).body;
  assert.ok(lounge.recommendations.every((r) => r.card.loungeAccess === true));
});

test("recommendations: bad requests are 400 with a message", async () => {
  await api.post("/api/recommendations").send({}).expect(400);
  const empty = await api.post("/api/recommendations").send({ manualCategoryTotals: { Dining: 0 } }).expect(400);
  assert.match(empty.body.error, /positive amount/i);
  await api.post("/api/recommendations").send({ manualCategoryTotals: { Dining: -5 } }).expect(400);
  await api.post("/api/recommendations").send({ useMyExpenses: true }).expect(401);
  await api.post("/api/recommendations").send({ statementId: "64b7f0a2c3d4e5f6a7b8c9d0" }).expect(404);
});

test("recommendations: signed-in user can score their own expenses", async () => {
  const res = await api.post("/api/recommendations").set(auth()).send({ useMyExpenses: true, topN: 3 }).expect(200);
  assert.equal(res.body.recommendations.length, 3);
  assert.deepEqual(Object.keys(res.body.categoryTotalsUsed), ["Fuel"]);
  const history = await api.get("/api/recommendations/history").set(auth()).expect(200);
  assert.ok(history.body.length >= 1);
});

test("statements: CSV upload is parsed, categorised, annualised and usable", async () => {
  const csv = [
    "Date,Description,Debit,Credit",
    "01/04/2024,SWIGGY ORDER 1,450.00,",
    "05/04/2024,ZOMATO ORDER,800.00,",
    "10/04/2024,HP PETROL PUMP,2500.00,",
    "15/04/2024,AMAZON PURCHASE,3000.00,",
    "20/04/2024,SALARY,,50000.00",
    "30/04/2024,IRCTC TICKET,1500.00,",
  ].join("\n");
  const up = await api.post("/api/statements").attach("file", Buffer.from(csv), "april.csv").expect(201);
  assert.equal(up.body.transactionCount, 6);
  assert.equal(up.body.totalSpending, 8250);
  assert.equal(up.body.periodDays, 30);
  const dining = up.body.categoryTotals.find((c) => c.category === "Dining");
  assert.equal(dining.totalAmount, 1250);

  const rec = await api.post("/api/recommendations").send({ statementId: up.body.statementId, topN: 3 }).expect(200);
  // one month scaled to a year: 8250 * 365 / 30
  assert.ok(Math.abs(rec.body.recommendations[0].calculationDetails.yearlySpend - (8250 * 365) / 30) < 1);

  const detail = await api.get(`/api/statements/${up.body.statementId}`).expect(200);
  assert.equal(detail.body.transactions.length, 6);
});

test("statements: rejects wrong type, missing file and empty content", async () => {
  await api.post("/api/statements").expect(400);
  await api.post("/api/statements").attach("file", Buffer.from("hello"), "notes.txt").expect(400);
  const empty = await api.post("/api/statements").attach("file", Buffer.from("Date,Description,Debit\n"), "empty.csv").expect(422);
  assert.match(empty.body.error, /transactions/i);
});

test("admin catalogue writes need an admin", async () => {
  const body = { name: "Test Card", issuer: "Test Bank", network: "Visa", rewardRate: 2 };
  await api.post("/api/cards").send(body).expect(401);
  await api.post("/api/cards").set(auth()).send(body).expect(403);
});

test("unknown routes and malformed JSON are handled", async () => {
  await api.get("/api/nope").expect(404);
  const bad = await api.post("/api/auth/login").set("Content-Type", "application/json").send("{bad json").expect(400);
  assert.match(bad.body.error, /json/i);
});
