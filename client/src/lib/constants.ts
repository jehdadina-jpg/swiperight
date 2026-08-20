export const APP_NAME = "SwipeRight";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const SPENDING_CATEGORIES = [
  "Dining",
  "Travel",
  "Fuel",
  "Shopping",
  "Utilities",
  "Subscriptions",
  "Healthcare",
  "Entertainment",
  "Education",
  "Bills",
  "Investments",
  "Groceries",
  "Others",
] as const;

export type SpendingCategory = typeof SPENDING_CATEGORIES[number];

export const CATEGORY_COLORS: Record<SpendingCategory, string> = {
  Dining: "#e74c3c",
  Travel: "#3498db",
  Fuel: "#e67e22",
  Shopping: "#9b59b6",
  Utilities: "#16a085",
  Subscriptions: "#f39c12",
  Healthcare: "#e91e63",
  Entertainment: "#2ecc71",
  Education: "#3498db",
  Bills: "#95a5a6",
  Investments: "#27ae60",
  Groceries: "#f1c40f",
  Others: "#7f8c8d",
};

export const CATEGORY_ICONS: Record<SpendingCategory, string> = {
  Dining: "🍽️",
  Travel: "✈️",
  Fuel: "⛽",
  Shopping: "🛍️",
  Utilities: "💡",
  Subscriptions: "📱",
  Healthcare: "⚕️",
  Entertainment: "🎬",
  Education: "📚",
  Bills: "📄",
  Investments: "📈",
  Groceries: "🛒",
  Others: "📦",
};

export const AUTH_TOKEN_KEY = "swiperight_auth_token";
export const AUTH_REFRESH_TOKEN_KEY = "swiperight_refresh_token";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  REFRESH: "/api/auth/refresh",
  LOGOUT: "/api/auth/logout",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  
  // Upload & Analysis
  UPLOAD_STATEMENT: "/api/upload/",
  ANALYZE_STATEMENT: "/api/upload/analyze/{statement_id}",

  // Recommendations
  GET_RECOMMENDATION: "/api/recommendation/",
  GET_RECOMMENDATIONS_HISTORY: "/api/recommendation/history",

  // Cards
  GET_CARDS: "/api/cards/",
  GET_CARD: (id: number) => `/api/cards/${id}`,

  // Chat
  SEND_MESSAGE: "/api/chat/",
  GET_CHAT_HISTORY: "/api/chat/history",
  
  // Export
  EXPORT_CSV: "/api/export/csv",
  EXPORT_PDF: "/api/export/pdf",
  
  // Admin
  ADMIN_CARDS: "/api/admin/cards",
  ADMIN_CARD: (id: number) => `/api/admin/cards/${id}`,
  ADMIN_USERS: "/api/admin/users",
  ADMIN_ANALYTICS: "/api/admin/analytics",
} as const;
