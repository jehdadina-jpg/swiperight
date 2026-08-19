// spend.js — Spend-pattern extraction via Gemini

const SPEND_SYSTEM_PROMPT = `You are a financial data classifier. The user will paste a list of transactions (in any format: CSV, plain English, amounts with merchant names, etc.).

Your task:
1. Classify all spending into EXACTLY these 7 categories: cashback, fuel, travel, dining, shopping, lifestyle, premium
2. Return ONLY a valid JSON object with these 7 keys, values as integers (0–100) summing to exactly 100
3. Map merchants intelligently: Swiggy/Zomato/restaurants → dining; Amazon/Flipkart/Myntra → shopping; Uber/Ola/Rapido → travel or lifestyle; petrol/fuel/BPCL/HPCL/IndianOil → fuel; flights/hotels/rail → travel; gym/spa/OTT → lifestyle; high-value luxury → premium
4. Do NOT include any explanation, only the JSON object.

Example output:
{"cashback":0,"fuel":15,"travel":25,"dining":20,"shopping":30,"lifestyle":10,"premium":0}`;

async function extractSpendPattern(rawText) {
  const responseText = await callGemini({
    systemPrompt: SPEND_SYSTEM_PROMPT,
    userMessage: rawText,
    temperature: 0.2
  });

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse spend categories from response");

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate keys and sum
  const required = ["cashback", "fuel", "travel", "dining", "shopping", "lifestyle", "premium"];
  for (const k of required) {
    if (typeof parsed[k] !== "number") throw new Error(`Missing category: ${k}`);
  }

  return parsed;
}

function renderSpendBars(distribution) {
  const container = document.getElementById("spend-bars");
  if (!container) return;
  container.innerHTML = "";

  const sorted = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  sorted.forEach(([tag, pct]) => {
    const color = TAG_COLORS[tag] || "#aaa";
    const label = TAG_LABELS[tag] || tag;
    const row = document.createElement("div");
    row.className = "spend-bar-row";
    row.innerHTML = `
      <div class="spend-bar-label">
        <span>${label}</span>
        <span class="spend-bar-pct mono">${pct}%</span>
      </div>
      <div class="spend-bar-track">
        <div class="spend-bar-fill" style="width:0%;background:${color}" data-target="${pct}"></div>
      </div>
    `;
    container.appendChild(row);
  });

  // Animate bars
  requestAnimationFrame(() => {
    container.querySelectorAll(".spend-bar-fill").forEach(el => {
      el.style.transition = "width 0.8s cubic-bezier(0.4,0,0.2,1)";
      el.style.width = el.dataset.target + "%";
    });
  });
}

function autoSetPrioritiesFromSpend(distribution) {
  const sorted = Object.entries(distribution)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const top3 = sorted.slice(0, 3).map(([tag]) => tag);
  // Update priority UI
  if (window.setPriorityFromSpend) {
    window.setPriorityFromSpend(top3);
  }
}

async function handleSpendAnalysis() {
  const textarea = document.getElementById("spend-input");
  const btn = document.getElementById("spend-analyze-btn");
  const errorEl = document.getElementById("spend-error");
  const resultsEl = document.getElementById("spend-results");

  if (!textarea || !textarea.value.trim()) return;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Analysing…`;
  if (errorEl) errorEl.textContent = "";
  if (resultsEl) resultsEl.style.display = "none";

  try {
    const dist = await extractSpendPattern(textarea.value.trim());
    renderSpendBars(dist);
    autoSetPrioritiesFromSpend(dist);
    if (resultsEl) resultsEl.style.display = "block";
  } catch (e) {
    if (errorEl) {
      if (e.message === "NO_API_KEY") {
        errorEl.textContent = "⚠️ Please enter your Gemini API key at the top of the page.";
      } else {
        errorEl.textContent = "Error: " + e.message;
      }
    }
  } finally {
    btn.disabled = false;
    btn.innerHTML = "✨ Analyse My Spend";
  }
}
