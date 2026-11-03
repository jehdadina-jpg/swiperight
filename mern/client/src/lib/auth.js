import { create } from "zustand";
import { AUTH_TOKEN_KEY, authAPI } from "./api";
export const useAuth = create((set) => ({
    user: null,
    checking: Boolean(localStorage.getItem(AUTH_TOKEN_KEY)),
    signIn: (token, user) => {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        set({ user, checking: false });
    },
    signOut: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        set({ user: null, checking: false });
    },
    restore: async () => {
        if (!localStorage.getItem(AUTH_TOKEN_KEY))
            return set({ checking: false });
        try {
            set({ user: await authAPI.me(), checking: false });
        }
        catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            set({ user: null, checking: false });
        }
    },
}));
