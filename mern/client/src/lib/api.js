import axios, { isAxiosError } from "axios";
export const AUTH_TOKEN_KEY = "swiperight_token";
// In dev, Vite proxies /api to the Express server; in production set VITE_API_URL
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "" });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
/** Pull a readable message out of an Express error response */
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
    if (isAxiosError(err)) {
        const msg = err.response?.data?.error;
        if (typeof msg === "string")
            return msg;
        if (!err.response)
            return "Can't reach the server. Is the API running?";
    }
    return fallback;
}
export const authAPI = {
    register: async (data) => (await api.post("/api/auth/register", data)).data,
    login: async (data) => (await api.post("/api/auth/login", data)).data,
    me: async () => (await api.get("/api/auth/me")).data.user,
};
export const statementAPI = {
    upload: async (file) => {
        const form = new FormData();
        form.append("file", file);
        return (await api.post("/api/statements", form)).data;
    },
};
export const recommendationAPI = {
    get: async (data) => (await api.post("/api/recommendations", data)).data,
};
export const cardsAPI = {
    getAll: async (params = {}) => (await api.get("/api/cards", { params })).data,
    getById: async (id) => (await api.get(`/api/cards/${id}`)).data,
    getIssuers: async () => (await api.get("/api/cards/issuers")).data,
};
export const expensesAPI = {
    list: async (params = {}) => (await api.get("/api/expenses", { params })).data,
    create: async (data) => (await api.post("/api/expenses", data)).data,
    update: async (id, data) => (await api.put(`/api/expenses/${id}`, data)).data,
    remove: async (id) => {
        await api.delete(`/api/expenses/${id}`);
    },
    summary: async () => (await api.get("/api/expenses/summary"))
        .data,
};
export const savedAPI = {
    list: async () => (await api.get("/api/saved")).data,
    add: async (cardId) => (await api.post("/api/saved", { cardId })).data,
    setNote: async (id, note) => (await api.put(`/api/saved/${id}`, { note })).data,
    remove: async (id) => {
        await api.delete(`/api/saved/${id}`);
    },
};
export default api;
