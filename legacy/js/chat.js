// chat.js — Chatbot panel logic

// Compact card DB serialization for system prompt context
function buildCardDBSummary() {
  return CARDS.map(c =>
    `[${c.id}] ${c.name} | ${c.issuer} | ${c.network} | Fee:₹${c.fee} | Tags:${c.tags.join(",")} | ${c.highlight} | MinInc:₹${c.minIncome} | MinCIBIL:${c.minCibil} | Churn:${c.churnRisk}`
  ).join("\n");
}

const CHAT_SYSTEM_PROMPT_TEMPLATE = `You are SwipeRight, a helpful Indian credit card advisor chatbot.
You have access to a database of 150 real Indian credit cards listed below.

RULES:
- Only recommend cards from the database below. Never invent cards not in the list.
- Never fabricate fees, rewards, or benefits not explicitly listed.
- Be concise: 3-5 sentences per response.
- Always remind users to verify details with the issuer.
- When recommending cards, mention the card name, issuer, and key benefit.
- Heuristic fields (churn risk, eligibility) are estimates, not verified data.
- You are not providing financial advice.

CARD DATABASE:
{{CARD_DB}}`;

let chatHistory = [];
let chatSystemPrompt = "";

function initChatbot() {
  chatSystemPrompt = CHAT_SYSTEM_PROMPT_TEMPLATE.replace("{{CARD_DB}}", buildCardDBSummary());
  chatHistory = [];

  const sendBtn = document.getElementById("chat-send-btn");
  const input = document.getElementById("chat-input");
  const toggleBtn = document.getElementById("chat-toggle-btn");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close-btn");

  if (sendBtn) sendBtn.addEventListener("click", sendChatMessage);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      panel.classList.toggle("chat-open");
      if (panel.classList.contains("chat-open")) {
        input && input.focus();
        if (chatHistory.length === 0) {
          appendBotMessage("👋 Hi! I'm your SwipeRight card advisor. Ask me anything — which card suits your needs, how two cards compare, or which one gives the best cashback on fuel!");
        }
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => panel.classList.remove("chat-open"));
  }
}

async function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  appendUserMessage(msg);
  showTypingIndicator();

  chatHistory.push({ role: "user", parts: [{ text: msg }] });

  try {
    const reply = await callGeminiChat({
      systemPrompt: chatSystemPrompt,
      history: chatHistory,
      temperature: 0.6
    });

    hideTypingIndicator();
    chatHistory.push({ role: "model", parts: [{ text: reply }] });
    appendBotMessage(reply);
  } catch (e) {
    hideTypingIndicator();
    if (e.message === "NO_API_KEY") {
      appendBotMessage("⚠️ Please enter your Gemini API key at the top of the page to use the chatbot.");
    } else {
      appendBotMessage(`Sorry, I encountered an error: ${e.message}`);
    }
  }
}

function appendUserMessage(text) {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = "chat-msg chat-msg-user";
  div.textContent = text;
  messages.appendChild(div);
  scrollChatToBottom();
}

function appendBotMessage(text) {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = "chat-msg chat-msg-bot";
  div.innerHTML = text.replace(/\n/g, "<br>");
  messages.appendChild(div);
  scrollChatToBottom();
}

function showTypingIndicator() {
  const messages = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.id = "chat-typing";
  div.className = "chat-msg chat-msg-bot chat-typing";
  div.innerHTML = `<span></span><span></span><span></span>`;
  messages.appendChild(div);
  scrollChatToBottom();
}

function hideTypingIndicator() {
  const el = document.getElementById("chat-typing");
  if (el) el.remove();
}

function scrollChatToBottom() {
  const messages = document.getElementById("chat-messages");
  if (messages) messages.scrollTop = messages.scrollHeight;
}
