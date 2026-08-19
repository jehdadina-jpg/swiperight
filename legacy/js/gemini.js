// gemini.js — Gemini API wrapper (free tier)
// Model: gemini-2.0-flash

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey() {
  return sessionStorage.getItem("gemini_api_key") || "";
}

async function callGemini({ systemPrompt, userMessage, temperature = 0.4 }) {
  const key = getApiKey();
  if (!key) throw new Error("NO_API_KEY");

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }]
      }
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 1024
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text.trim();
}

/**
 * Multi-turn chat variant — builds a conversation history array.
 * history: [{ role: "user"|"model", parts: [{text}] }, ...]
 */
async function callGeminiChat({ systemPrompt, history, temperature = 0.5 }) {
  const key = getApiKey();
  if (!key) throw new Error("NO_API_KEY");

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${key}`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: history,
    generationConfig: {
      temperature,
      maxOutputTokens: 512
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text.trim();
}
