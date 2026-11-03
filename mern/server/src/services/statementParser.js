import { parse as parseCsv } from "csv-parse/sync";

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
  january: 0, february: 1, march: 2, april: 3, june: 5, july: 6, august: 7, september: 8,
  october: 9, november: 10, december: 11,
};

const MERCHANT_MAP = [
  ["SWIGGY", "Swiggy"], ["ZOMATO", "Zomato"], ["AMAZON PRIME", "Amazon Prime"], ["PRIME VIDEO", "Amazon Prime"],
  ["AMAZON", "Amazon"], ["FLIPKART", "Flipkart"], ["UBER", "Uber"], ["OLA", "Ola"], ["BIGBASKET", "BigBasket"],
  ["BLINKIT", "Blinkit"], ["ZEPTO", "Zepto"], ["NETFLIX", "Netflix"], ["HOTSTAR", "Disney+ Hotstar"],
  ["SPOTIFY", "Spotify"], ["IRCTC", "IRCTC"], ["MAKEMYTRIP", "MakeMyTrip"], ["GOIBIBO", "Goibibo"],
  ["BOOKMYSHOW", "BookMyShow"], ["PAYTM", "Paytm"], ["PHONEPE", "PhonePe"], ["GPAY", "Google Pay"],
  ["GOOGLEPAY", "Google Pay"],
];

export function normalizeMerchant(raw) {
  let m = String(raw).toUpperCase().trim();
  const noise = [/\d{2}\/\d{2}/g, /[A-Z]{2,}\d{4,}/g, /^\*+/, /\*+$/, /^\d+\s*-\s*/, /\s+(POS|ATM|UPI|NEFT)\s+/g];
  for (const re of noise) m = m.replace(re, " ");
  m = m.split(/\s+/).filter(Boolean).join(" ");
  for (const [key, value] of MERCHANT_MAP) {
    const hit = key === "OLA" ? /\bOLA\b/.test(m) : m.includes(key);
    if (hit) return value;
  }
  return m.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function validDate(y, mon, d) {
  const dt = new Date(Date.UTC(y, mon, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mon && dt.getUTCDate() === d ? dt : null;
}

export function parseDate(input) {
  const s = String(input ?? "").trim();
  if (!s) return null;
  let m;
  // 31/12/2024, 31-12-24, 31.12.2024 (day first, as on Indian statements)
  if ((m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/))) {
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return validDate(y, Number(m[2]) - 1, Number(m[1]));
  }
  // 2024-12-31
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return validDate(+m[1], +m[2] - 1, +m[3]);
  // 1st November 2018, 01 Nov 2018, 01-Nov-2018
  if ((m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]{3,9})[\s,-]+(\d{2,4})$/))) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (mon === undefined) return null;
    let y = Number(m[3]);
    if (y < 100) y += 2000;
    return validDate(y, mon, Number(m[1]));
  }
  return null;
}

const cleanAmount = (s) => String(s).replace(/[₹$£€,\s]/g, "").replace(/[()]/g, "");

function inferType(row, raw) {
  const typeCols = ["Type", "type", "Transaction Type", "Txn Type", "Dr/Cr", "DR/CR", "Dr Cr", "Indicator"];
  for (const col of typeCols) {
    const v = row[col]?.toString().trim().toLowerCase();
    if (v) {
      if (["cr", "credit", "c", "deposit"].includes(v)) return "credit";
      if (["dr", "debit", "d", "withdrawal"].includes(v)) return "debit";
    }
  }
  if (/\bcr\b/i.test(raw)) return "credit";
  return "debit";
}

const pick = (row, cols) => cols.map((c) => row[c]).find((v) => v !== undefined && String(v).trim() !== "");

function toTxn(date, merchant, amount, type) {
  return { date, merchant, normalizedMerchant: normalizeMerchant(merchant), amount, type, description: merchant };
}

function parseCsvRow(row) {
  const date = parseDate(pick(row, ["Date", "date", "Transaction Date", "Txn Date", "Posted Date"]));
  const merchant = String(
    pick(row, ["Description", "description", "Narration", "Particulars", "Details"]) ?? ""
  ).trim();
  if (!date || !merchant) return null;

  let amount = 0;
  let type = null;
  const debit = Number(cleanAmount(pick(row, ["Debit", "debit", "Debit Amount", "Withdrawal", "Dr Amount"]) ?? ""));
  if (debit) {
    amount = Math.abs(debit);
    type = "debit";
  }
  if (!type) {
    const credit = Number(cleanAmount(pick(row, ["Credit", "credit", "Credit Amount", "Deposit", "Cr Amount"]) ?? ""));
    if (credit) {
      amount = Math.abs(credit);
      type = "credit";
    }
  }
  if (!type) {
    const raw = pick(row, ["Amount", "amount", "Transaction Amount", "Txn Amount"]);
    if (raw !== undefined) {
      const signed = Number(cleanAmount(raw));
      if (signed) {
        amount = Math.abs(signed);
        type = inferType(row, String(raw));
      }
    }
  }
  return amount > 0 && type ? toTxn(date, merchant, amount, type) : null;
}

function detectDelimiter(text) {
  const head = text.split(/\r?\n/, 1)[0] ?? "";
  return [",", ";", "\t", "|"].map((d) => [d, head.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
}

function dedupe(txns) {
  const seen = new Set();
  return txns.filter((t) => {
    const key = `${t.date.toISOString().slice(0, 10)}|${t.normalizedMerchant}|${t.amount}|${t.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseCsvText(text) {
  const clean = text.replace(/^﻿/, "");
  const rows = parseCsv(clean, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    delimiter: detectDelimiter(clean),
  });
  return dedupe(rows.map(parseCsvRow).filter(Boolean));
}

const DATE_RE = String.raw`(?:\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9}\s+\d{4}|\d{2}[-/]\d{2}[-/]\d{2,4})`;
// Amounts must carry paise so a timestamp fragment such as "11:22" never matches
const AMT_RE = String.raw`[\d,]+\.\d{2}`;
const PRE_AMT = String.raw`[\s₹$£€,�]*`;

export function parseStatementText(text) {
  const patterns = [
    new RegExp(`(${DATE_RE})\\s+(.+?)${PRE_AMT}(${AMT_RE})\\s*(DR|CR)?`, "gm"),
    new RegExp(`(${DATE_RE})${PRE_AMT}(${AMT_RE})\\s+(.+?)(?:\\n|$)`, "gm"),
  ];
  const out = [];
  patterns.forEach((re, idx) => {
    for (const m of text.matchAll(re)) {
      const date = parseDate(m[1]);
      const merchant = (idx === 0 ? m[2] : m[3]).trim();
      const amount = Number(cleanAmount(idx === 0 ? m[3] : m[2]));
      if (!date || !merchant || !(amount > 0)) continue;
      const credit = (idx === 0 && m[4] === "CR") || /^\s*(?:bank\s+)?credit\b/i.test(merchant);
      out.push(toTxn(date, merchant, amount, credit ? "credit" : "debit"));
    }
  });
  return dedupe(out);
}

export async function parsePdfBuffer(buffer) {
  // The package index runs a debug routine on import, so load the parser module directly
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
  const { text } = await pdfParse(buffer);
  return parseStatementText(text);
}

export async function parseStatement(buffer, fileType) {
  if (fileType === "pdf") return parsePdfBuffer(buffer);
  if (fileType === "csv") return parseCsvText(buffer.toString("utf8"));
  throw new Error(`Unsupported file type: ${fileType}`);
}

// Span of a statement in days, used to scale its debit total to a 12-month figure
export function periodDaysOf(txns) {
  if (!txns.length) return 365;
  const times = txns.map((t) => t.date.getTime());
  const span = Math.round((Math.max(...times) - Math.min(...times)) / 86400000) + 1;
  return Math.max(30, Math.min(span, 365));
}
