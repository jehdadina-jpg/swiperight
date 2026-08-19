// score.js — Priority scoring & churn risk heuristic

/**
 * Score a card based on user's ranked priorities.
 * Weights: 1st = 3, 2nd = 2, 3rd = 1
 */
function scoreCard(card, priorities) {
  let score = 0;
  priorities.forEach((tag, index) => {
    if (tag && card.tags.includes(tag)) {
      score += (3 - index);
    }
  });
  return score;
}

/**
 * Compute churn risk heuristic client-side.
 * This is NOT real ML or verified data — it's a simple heuristic.
 */
const CO_BRANDED_KEYWORDS = [
  "swiggy", "zomato", "flipkart", "amazon", "airtel", "paytm", "ola",
  "indigo", "indiGo", "6e", "irctc", "bpcl", "hpcl", "indianoil",
  "tata neu", "myntra", "vistara", "air india", "etihad", "british airways",
  "makemytrip", "yatra", "easemytrip", "adani", "manchester united",
  "ferrari", "samsung", "cred", "scapia", "landmark"
];

function computeChurnRisk(card) {
  const nameLower = card.name.toLowerCase();
  const highlightLower = (card.highlight || "").toLowerCase();
  const combined = nameLower + " " + highlightLower;

  // Co-branded merchant keyword → High
  for (const kw of CO_BRANDED_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) {
      return "High";
    }
  }

  // Premium tier + fee >= 8000 → Medium
  if (card.tags.includes("premium") && card.fee >= 8000) {
    return "Medium";
  }

  // Lifetime free + cashback flat → Low
  if (card.fee === 0 && card.tags.includes("cashback")) {
    return "Low";
  }

  // Default → Medium
  return "Medium";
}

/**
 * Get sorted cards by score (descending).
 */
function getSortedCards(cards, priorities) {
  return [...cards]
    .map(c => ({ ...c, score: scoreCard(c, priorities) }))
    .sort((a, b) => b.score - a.score || a.fee - b.fee);
}

/**
 * Apply all filters to the card list.
 */
function applyFilters(cards, { maxFee, network, search, maxIncome, minCibil }) {
  return cards.filter(card => {
    if (card.fee > maxFee) return false;
    if (network !== "All" && card.network !== network) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !card.name.toLowerCase().includes(q) &&
        !card.issuer.toLowerCase().includes(q) &&
        !card.highlight.toLowerCase().includes(q) &&
        !card.tags.some(t => t.includes(q))
      ) return false;
    }
    if (maxIncome !== null && card.minIncome > maxIncome) return false;
    if (minCibil !== null && card.minCibil > minCibil) return false;
    return true;
  });
}
