import axios from "axios";
import { API_URL, API_ENDPOINTS, AUTH_TOKEN_KEY } from "./constants";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT access token (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On a 401, the token is missing/invalid/expired: clear it and send the
// user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        // Full navigation (not client-side router) so any stale in-memory
        // auth state is discarded along with the redirect. This runs inside
        // an axios interceptor, outside React component/render context, so
        // next/navigation's router isn't available here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; full_name: string }) => {
    const res = await api.post(API_ENDPOINTS.REGISTER, data);
    return res.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const res = await api.post(API_ENDPOINTS.LOGIN, data);
    if (res.data.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, res.data.access_token);
    }
    return res.data;
  },
  
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

// Upload API
export const uploadAPI = {
  uploadStatement: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const res = await api.post(API_ENDPOINTS.UPLOAD_STATEMENT, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  
  analyzeStatement: async (statementId: number) => {
    const res = await api.post(API_ENDPOINTS.ANALYZE_STATEMENT.replace("{statement_id}", statementId.toString()));
    return res.data;
  },
  
  getHistory: async () => {
    const res = await api.get(API_ENDPOINTS.GET_RECOMMENDATIONS_HISTORY);
    return res.data;
  },
};

// Recommendation API
export const recommendationAPI = {
  getRecommendation: async (data: {
    statement_id?: number;
    manual_category_totals?: Record<string, number>;
    user_income?: number;
    user_cibil?: number;
    strategy?: string;
    excluded_issuers?: string[];
    max_annual_fee?: number;
    require_lounge_access?: boolean;
    top_n?: number;
  }) => {
    const res = await api.post(API_ENDPOINTS.GET_RECOMMENDATION, data);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(`${API_ENDPOINTS.GET_RECOMMENDATION}${id}`);
    return res.data;
  },
};

// Cards API
export const cardsAPI = {
  getAll: async (params: {
    limit?: number;
    offset?: number;
    search?: string;
    issuer?: string;
    network?: string;
    tag?: string;
    max_annual_fee?: number;
    lounge_access?: boolean;
    sort_by?: string;
    sort_dir?: string;
  } = {}) => {
    const res = await api.get(API_ENDPOINTS.GET_CARDS, { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get(API_ENDPOINTS.GET_CARD(id));
    return res.data;
  },

  getIssuers: async (): Promise<string[]> => {
    const res = await api.get(API_ENDPOINTS.GET_ISSUERS);
    return res.data;
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (data: { message: string; recommendation_id: number }) => {
    const res = await api.post(API_ENDPOINTS.SEND_MESSAGE, data);
    return res.data;
  },
};

export default api;
