// filters.js — All filter, slider, and priority state management

const state = {
  priorities: [null, null, null],  // up to 3 ranked tags
  maxFee: 60000,
  network: "All",
  search: "",
  maxIncome: null,    // null = no filter
  minCibil: null      // null = no filter
};

function initFilters() {
  // Priority tag buttons
  const tagBtns = document.querySelectorAll(".priority-tag-btn");
  tagBtns.forEach(btn => {
    btn.addEventListener("click", () => togglePriorityTag(btn.dataset.tag));
  });

  // Max fee slider
  const feeSlider = document.getElementById("fee-slider");
  const feeVal = document.getElementById("fee-value");
  if (feeSlider) {
    feeSlider.addEventListener("input", () => {
      const v = parseInt(feeSlider.value);
      state.maxFee = v;
      if (feeVal) feeVal.textContent = v === 0 ? "Lifetime Free" : `₹${v.toLocaleString("en-IN")}`;
      window.rerenderAll && window.rerenderAll();
    });
  }

  // Network dropdown
  const networkSel = document.getElementById("network-select");
  if (networkSel) {
    networkSel.addEventListener("change", () => {
      state.network = networkSel.value;
      window.rerenderAll && window.rerenderAll();
    });
  }

  // Search input
  const searchInp = document.getElementById("search-input");
  if (searchInp) {
    let debounce;
    searchInp.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        state.search = searchInp.value.trim();
        window.rerenderAll && window.rerenderAll();
      }, 200);
    });
  }

  // Income slider
  const incomeSlider = document.getElementById("income-slider");
  const incomeVal = document.getElementById("income-value");
  if (incomeSlider) {
    incomeSlider.addEventListener("input", () => {
      const v = parseInt(incomeSlider.value);
      state.maxIncome = v >= 3000000 ? null : v;
      if (incomeVal) {
        incomeVal.textContent = v >= 3000000 ? "Any" : `₹${(v / 100000).toFixed(0)}L`;
      }
      window.rerenderAll && window.rerenderAll();
    });
  }

  // CIBIL slider
  const cibilSlider = document.getElementById("cibil-slider");
  const cibilVal = document.getElementById("cibil-value");
  if (cibilSlider) {
    cibilSlider.addEventListener("input", () => {
      const v = parseInt(cibilSlider.value);
      state.minCibil = v <= 300 ? null : v;
      if (cibilVal) cibilVal.textContent = v <= 300 ? "Any" : v;
      window.rerenderAll && window.rerenderAll();
    });
  }

  // API key input
  const apiKeyInp = document.getElementById("api-key-input");
  const apiKeySave = document.getElementById("api-key-save");
  if (apiKeyInp) {
    const savedKey = sessionStorage.getItem("gemini_api_key") || "";
    if (savedKey) apiKeyInp.value = savedKey;
    apiKeyInp.addEventListener("input", () => {
      sessionStorage.setItem("gemini_api_key", apiKeyInp.value.trim());
    });
  }
  if (apiKeySave) {
    apiKeySave.addEventListener("click", () => {
      const key = document.getElementById("api-key-input").value.trim();
      sessionStorage.setItem("gemini_api_key", key);
      showToast("API key saved for this session ✓");
    });
  }
}

function togglePriorityTag(tag) {
  const idx = state.priorities.indexOf(tag);
  if (idx !== -1) {
    // Remove it and shift others
    state.priorities.splice(idx, 1);
    state.priorities.push(null);
  } else {
    // Add to first empty slot
    const emptyIdx = state.priorities.indexOf(null);
    if (emptyIdx !== -1) {
      state.priorities[emptyIdx] = tag;
    } else {
      // All 3 full — replace last
      state.priorities[2] = tag;
    }
  }
  updatePriorityUI();
  window.rerenderAll && window.rerenderAll();
}

function updatePriorityUI() {
  const tagBtns = document.querySelectorAll(".priority-tag-btn");
  tagBtns.forEach(btn => {
    const tag = btn.dataset.tag;
    const idx = state.priorities.indexOf(tag);
    btn.classList.remove("priority-1", "priority-2", "priority-3", "priority-active");
    if (idx !== -1) {
      btn.classList.add("priority-active", `priority-${idx + 1}`);
      btn.querySelector(".priority-rank").textContent = idx + 1;
      btn.querySelector(".priority-rank").style.display = "inline";
    } else {
      btn.querySelector(".priority-rank").style.display = "none";
    }
  });

  // Update priority display badges
  const badges = document.querySelectorAll(".selected-priority");
  badges.forEach((b, i) => {
    const tag = state.priorities[i];
    if (tag) {
      b.textContent = TAG_LABELS[tag] || tag;
      b.style.background = TAG_COLORS[tag] + "33";
      b.style.color = TAG_COLORS[tag];
      b.style.display = "inline-flex";
    } else {
      b.style.display = "none";
    }
  });
}

// Called from spend.js to auto-set priorities
window.setPriorityFromSpend = function(top3Tags) {
  state.priorities = [null, null, null];
  top3Tags.slice(0, 3).forEach((tag, i) => {
    state.priorities[i] = tag;
  });
  updatePriorityUI();
  window.rerenderAll && window.rerenderAll();

  // Scroll to priorities section
  document.getElementById("priority-section")?.scrollIntoView({ behavior: "smooth" });
};

function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("toast-show"), 10);
  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function getFilteredSortedCards() {
  const filtered = applyFilters(CARDS, {
    maxFee: state.maxFee,
    network: state.network,
    search: state.search,
    maxIncome: state.maxIncome,
    minCibil: state.minCibil
  });
  return getSortedCards(filtered, state.priorities);
}
