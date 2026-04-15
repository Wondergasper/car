import { create } from "zustand";

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
      const data = response.data;
      
      localStorage.setItem("token", data.access_token);
      set({ user: data.user, token: data.access_token, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
