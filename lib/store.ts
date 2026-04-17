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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { access_token, user } = response.data;

      localStorage.setItem("token", access_token);
      // Set cookie so Next.js middleware can detect auth state
      Cookies.set("token", access_token, { sameSite: "strict" });
      set({ user, token: access_token, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    Cookies.remove("token"); // Clear cookie so middleware redirects correctly
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
