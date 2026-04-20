import { create } from "zustand";
import { authApi } from "@/lib/api";
import Cookies from "js-cookie";

interface User {
  id: string;
  email: string;
  companyName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

// Hydrate auth state from persisted token on startup
const _persistedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: _persistedToken,
  isAuthenticated: !!_persistedToken,   // ← hydrated from localStorage

  login: async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { access_token, user } = response.data;
    localStorage.setItem("token", access_token);
    Cookies.set("token", access_token, { sameSite: "strict" });
    set({ user, token: access_token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
