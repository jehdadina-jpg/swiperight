// whycard.js — "Why this card?" AI explanation via Gemini

const WHY_SYSTEM_PROMPT = `You are an honest, knowledgeable Indian credit card advisor. 
You will be given a user's spending priorities and a specific credit card's details.
Write a 2-3 sentence explanation of how well this card fits the user's priorities.
Be honest — if the fit is partial or weak, say so clearly.
NEVER invent fees, rewards rates, or benefits not provided in the card data.
Keep it concise and in plain English. Do not use bullet points.`;

async function fetchWhyThisCard(card, priorities) {
  const priorityStr = priorities
    .filter(Boolean)
    .map((p, i) => `Priority ${i + 1}: ${p}`)
    .join(", ");

  const cardStr = `
Card: ${card.name}
Issuer: ${card.issuer}
Network: ${card.network}
Annual Fee: ₹${card.fee === 0 ? "0 (Lifetime Free)" : card.fee.toLocaleString("en-IN")}
Categories: ${card.tags.join(", ")}
Key Benefit: ${card.highlight}
Min Income: ₹${card.minIncome > 0 ? card.minIncome.toLocaleString("en-IN") + " p.a." : "Not specified"}
Churn Risk: ${card.churnRisk} (heuristic estimate)
  `.trim();

  const userMessage = `User's spending priorities: ${priorityStr}\n\nCard details:\n${cardStr}`;

  return callGemini({
    systemPrompt: WHY_SYSTEM_PROMPT,
    userMessage,
    temperature: 0.5
  });
}

async function handleWhyCardClick(card, priorities, cardIndex) {
  const btn = document.getElementById(`why-btn-${cardIndex}`);
  const textEl = document.getElementById(`why-text-${cardIndex}`);
  const boxEl = document.getElementById(`why-box-${cardIndex}`);

  if (!btn || !textEl || !boxEl) return;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span>`;
  boxEl.style.display = "block";
  textEl.innerHTML = `<div class="why-skeleton">
    <div class="skeleton-line"></div>
    <div class="skeleton-line" style="width:85%"></div>
    <div class="skeleton-line" style="width:70%"></div>
  </div>`;

  try {
    const explanation = await fetchWhyThisCard(card, priorities);
    textEl.innerHTML = `<p class="why-text-content">${explanation}</p>`;
    btn.innerHTML = "🔄 Refresh";
    btn.disabled = false;
    btn.onclick = () => handleWhyCardClick(card, priorities, cardIndex);
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      textEl.innerHTML = `<p class="why-error">⚠️ Enter your Gemini API key at the top of the page to use AI features.</p>`;
    } else {
      textEl.innerHTML = `<p class="why-error">Error: ${e.message}</p>`;
    }
    btn.innerHTML = "🤖 Why this card?";
    btn.disabled = false;
  }
}
