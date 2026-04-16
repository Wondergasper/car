"use client";

import { Bell, LogOut, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 glass-panel border-b-0 border-white/5 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-green-400">System Healthy</span>
        </div>

        <div className="flex items-center gap-x-6">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-pink animate-pulse" />
          </button>
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />
          <div className="flex items-center gap-x-4">
            <div className="hidden sm:flex sm:items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {user?.companyName?.charAt(0) || "C"}
              </div>
              <span className="text-sm font-semibold text-gray-200">
                {user?.companyName || "Acme Corp"}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-x-2 text-sm font-medium text-gray-400 hover:text-brand-pink transition-colors ml-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
