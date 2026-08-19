// ui.js — Render card tiles, table, compare modal

let compareSet = new Set();

// ─── Card tile gradients ───────────────────────────────────────
const TILE_GRADIENTS = [
  "linear-gradient(135deg, #1a2a4a 0%, #2d4a7a 100%)",
  "linear-gradient(135deg, #1a3a2a 0%, #2d6a4a 100%)",
  "linear-gradient(135deg, #3a1a2a 0%, #6a2d4a 100%)",
  "linear-gradient(135deg, #2a1a3a 0%, #4a2d7a 100%)",
  "linear-gradient(135deg, #3a2a1a 0%, #7a4a2d 100%)",
  "linear-gradient(135deg, #1a3a3a 0%, #2d6a6a 100%)"
];

function getTileGradient(index) {
  return TILE_GRADIENTS[index % TILE_GRADIENTS.length];
}

function churnBadgeHtml(risk) {
  const colors = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
  const icons = { Low: "🟢", Medium: "🟡", High: "🔴" };
  const color = colors[risk] || "#aaa";
  return `<span class="churn-badge" style="background:${color}22;color:${color};border:1px solid ${color}66">${icons[risk] || "⚪"} ${risk} Churn Risk</span>`;
}

function tagPillsHtml(tags) {
  return tags.map(t => {
    const color = TAG_COLORS[t] || "#aaa";
    const label = TAG_LABELS[t] || t;
    return `<span class="tag-pill" style="background:${color}22;color:${color};border:1px solid ${color}44">${label}</span>`;
  }).join("");
}

function feeHtml(fee) {
  if (fee === 0) return `<span class="fee-free mono">Lifetime Free</span>`;
  return `<span class="mono">₹${fee.toLocaleString("en-IN")}<span class="fee-label">/yr</span></span>`;
}

// ─── Top-3 Card Tiles ───────────────────────────────────────
function renderTopCards(cards, priorities) {
  const container = document.getElementById("top-cards");
  if (!container) return;

  const top3 = cards.slice(0, 3);

  if (top3.length === 0) {
    container.innerHTML = `<div class="no-results">No cards match your current filters.</div>`;
    return;
  }

  container.innerHTML = top3.map((card, i) => {
    const rankLabel = ["🥇 Best Pick", "🥈 Runner-up", "🥉 Third Pick"][i];
    const gradient = getTileGradient(i);
    const scoreBar = card.score > 0
      ? `<div class="score-bar"><div class="score-fill" style="width:${Math.min(card.score / 6 * 100, 100)}%"></div></div>`
      : "";

    return `
    <div class="card-tile animate-in" style="--delay:${i * 0.1}s;background:${gradient}" data-id="${card.id}">
      <div class="tile-rank">${rankLabel}</div>
      <div class="tile-header">
        <div>
          <div class="tile-name">${card.name}</div>
          <div class="tile-issuer">${card.issuer} · ${card.network}</div>
        </div>
        <div class="tile-fee">${feeHtml(card.fee)}</div>
      </div>
      ${scoreBar}
      <div class="tile-highlight">${card.highlight}</div>
      <div class="tile-tags">${tagPillsHtml(card.tags)}</div>
      ${churnBadgeHtml(card.churnRisk)}
      <div class="tile-eligibility">
        <span class="mono">Min Income: ₹${card.minIncome > 0 ? card.minIncome.toLocaleString("en-IN") : "Not specified"}</span>
        <span class="mono">Min CIBIL: ${card.minCibil > 0 ? card.minCibil : "Not specified"}</span>
      </div>
      <div class="tile-actions">
        <button class="why-btn" id="why-btn-${i}" onclick="handleWhyCardClick(window._top3Cards[${i}], window._priorities, ${i})">
          🤖 Why this card?
        </button>
      </div>
      <div class="why-box" id="why-box-${i}" style="display:none">
        <div class="why-text" id="why-text-${i}"></div>
      </div>
    </div>`;
  }).join("");

  // Store for AI callbacks
  window._top3Cards = top3;
}

// ─── Full Table ───────────────────────────────────────
let sortKey = "score";
let sortDir = -1;

function renderTable(cards) {
  const tbody = document.getElementById("card-table-body");
  const countEl = document.getElementById("card-count");
  if (!tbody) return;

  if (countEl) countEl.textContent = `${cards.length} cards`;

  if (cards.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="no-results-td">No cards match your filters.</td></tr>`;
    return;
  }

  // Sort
  const sorted = [...cards].sort((a, b) => {
    let av = a[sortKey], bv = b[sortKey];
    if (sortKey === "score") { av = a.score ?? 0; bv = b.score ?? 0; }
    if (typeof av === "string") return sortDir * av.localeCompare(bv);
    return sortDir * (av - bv);
  });

  tbody.innerHTML = sorted.map(card => {
    const inCompare = compareSet.has(card.id);
    const churnColors = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
    const churnColor = churnColors[card.churnRisk] || "#aaa";

    return `<tr class="table-row ${inCompare ? "row-selected" : ""}" data-id="${card.id}">
      <td>
        <label class="compare-check">
          <input type="checkbox" ${inCompare ? "checked" : ""} 
            onchange="toggleCompare(${card.id}, this.checked)"
            ${!inCompare && compareSet.size >= 3 ? "disabled" : ""}>
          <span>Add</span>
        </label>
      </td>
      <td><div class="table-name">${card.name}</div><div class="table-issuer">${card.issuer}</div></td>
      <td><span class="network-badge network-${card.network.toLowerCase()}">${card.network}</span></td>
      <td class="mono">${card.fee === 0 ? '<span class="fee-free-sm">Free</span>' : '₹' + card.fee.toLocaleString("en-IN")}</td>
      <td><div class="table-tags">${card.tags.slice(0,3).map(t => `<span class="tag-dot" style="background:${TAG_COLORS[t]}" title="${TAG_LABELS[t]}"></span>`).join("")}</div></td>
      <td class="mono">${card.minIncome > 0 ? '₹' + (card.minIncome/100000).toFixed(0) + 'L' : '—'}</td>
      <td class="mono">${card.minCibil > 0 ? card.minCibil : '—'}</td>
      <td><span class="churn-sm" style="color:${churnColor}">${card.churnRisk}</span></td>
    </tr>`;
  }).join("");
}

function initTableSort() {
  document.querySelectorAll("[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (sortKey === key) sortDir *= -1;
      else { sortKey = key; sortDir = -1; }
      document.querySelectorAll("[data-sort]").forEach(h => h.classList.remove("sort-asc", "sort-desc"));
      th.classList.add(sortDir === -1 ? "sort-desc" : "sort-asc");
      window.rerenderAll && window.rerenderAll();
    });
  });
}

// ─── Compare Mode ───────────────────────────────────────
function toggleCompare(cardId, checked) {
  if (checked) {
    if (compareSet.size >= 3) return;
    compareSet.add(cardId);
  } else {
    compareSet.delete(cardId);
  }
  updateCompareTray();
  window.rerenderAll && window.rerenderAll();
}

function updateCompareTray() {
  const tray = document.getElementById("compare-tray");
  const countEl = document.getElementById("compare-count");
  if (!tray) return;

  if (compareSet.size > 0) {
    tray.classList.add("tray-visible");
    if (countEl) countEl.textContent = compareSet.size;
  } else {
    tray.classList.remove("tray-visible");
  }
}

function openCompareModal() {
  if (compareSet.size < 2) {
    alert("Select at least 2 cards to compare.");
    return;
  }

  const selected = CARDS.filter(c => compareSet.has(c.id));
  const modal = document.getElementById("compare-modal");
  const body = document.getElementById("compare-modal-body");

  const fields = [
    ["Issuer", c => c.issuer],
    ["Network", c => c.network],
    ["Annual Fee", c => c.fee === 0 ? "Lifetime Free" : `₹${c.fee.toLocaleString("en-IN")}`],
    ["Categories", c => c.tags.map(t => TAG_LABELS[t]).join(", ")],
    ["Key Benefit", c => c.highlight],
    ["Min Income", c => c.minIncome > 0 ? `₹${c.minIncome.toLocaleString("en-IN")}` : "Not specified"],
    ["Min CIBIL", c => c.minCibil > 0 ? c.minCibil : "Not specified"],
    ["Churn Risk ⚠️", c => c.churnRisk]
  ];

  const churnColors = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };

  body.innerHTML = `
    <div class="compare-grid" style="grid-template-columns: 160px repeat(${selected.length}, 1fr)">
      <div class="compare-header-cell"></div>
      ${selected.map(c => `<div class="compare-header-cell">
        <div class="compare-card-name">${c.name}</div>
        <div class="compare-card-issuer">${c.issuer}</div>
      </div>`).join("")}
      ${fields.map(([label, getter]) => `
        <div class="compare-label-cell">${label}</div>
        ${selected.map(c => {
          const val = getter(c);
          const style = label.includes("Churn") ? `color:${churnColors[val]||"#aaa"};font-weight:600` : "";
          return `<div class="compare-value-cell" style="${style}">${val}</div>`;
        }).join("")}
      `).join("")}
    </div>
  `;

  modal.classList.add("modal-open");
  document.body.style.overflow = "hidden";
}

function closeCompareModal() {
  document.getElementById("compare-modal").classList.remove("modal-open");
  document.body.style.overflow = "";
}

function clearCompare() {
  compareSet.clear();
  updateCompareTray();
  window.rerenderAll && window.rerenderAll();
}
