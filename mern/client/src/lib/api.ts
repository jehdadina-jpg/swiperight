import axios, { isAxiosError } from "axios";

export const AUTH_TOKEN_KEY = "swiperight_token";

// In dev, Vite proxies /api to the Express server; in production set VITE_API_URL
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Pull a readable message out of an Express error response */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(err)) {
    const msg = err.response?.data?.error;
    if (typeof msg === "string") return msg;
    if (!err.response) return "Can't reach the server. Is the API running?";
  }
  return fallback;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "user" | "admin";
}

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface CategoryTotal {
  category: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}

export interface StatementSummary {
  statementId: string;
  fileName: string;
  transactionCount: number;
  totalSpending: number;
  periodDays: number;
  categoryTotals: CategoryTotal[];
}

export interface RecommendationRequest {
  statementId?: string;
  manualCategoryTotals?: Record<string, number>;
  useMyExpenses?: boolean;
  excludedIssuers?: string[];
  maxAnnualFee?: number;
  requireLoungeAccess?: boolean;
  topN?: number;
}

export const authAPI = {
  register: async (data: { email: string; password: string; fullName: string }) =>
    (await api.post<{ token: string; user: User }>("/api/auth/register", data)).data,
  login: async (data: { email: string; password: string }) =>
    (await api.post<{ token: string; user: User }>("/api/auth/login", data)).data,
  me: async () => (await api.get<{ user: User }>("/api/auth/me")).data.user,
};

export const statementAPI = {
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return (await api.post<StatementSummary>("/api/statements", form)).data;
  },
};

export const recommendationAPI = {
  get: async (data: RecommendationRequest) => (await api.post("/api/recommendations", data)).data,
};

export const cardsAPI = {
  getAll: async (params: Record<string, string | number | boolean | undefined> = {}) =>
    (await api.get("/api/cards", { params })).data,
  getById: async (id: string) => (await api.get(`/api/cards/${id}`)).data,
  getIssuers: async (): Promise<string[]> => (await api.get("/api/cards/issuers")).data,
};

export const expensesAPI = {
  list: async (params: { category?: string } = {}) => (await api.get<Expense[]>("/api/expenses", { params })).data,
  create: async (data: Omit<Expense, "id">) => (await api.post<Expense>("/api/expenses", data)).data,
  update: async (id: string, data: Partial<Omit<Expense, "id">>) =>
    (await api.put<Expense>(`/api/expenses/${id}`, data)).data,
  remove: async (id: string) => {
    await api.delete(`/api/expenses/${id}`);
  },
  summary: async () =>
    (await api.get<{ categories: { category: string; total: number; count: number }[]; total: number }>("/api/expenses/summary"))
      .data,
};

export const savedAPI = {
  list: async () => (await api.get("/api/saved")).data as { id: string; note: string; card: import("./savedCards").SavedCard }[],
  add: async (cardId: string) => (await api.post("/api/saved", { cardId })).data,
  setNote: async (id: string, note: string) => (await api.put(`/api/saved/${id}`, { note })).data,
  remove: async (id: string) => {
    await api.delete(`/api/saved/${id}`);
  },
};

export default api;
