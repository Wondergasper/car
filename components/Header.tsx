"use client";

import { Bell, LogOut, CheckCircle2, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore, useUIStore } from "@/lib/store";

export default function Header() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 sm:h-20 shrink-0 items-center gap-x-4 bg-background/60 backdrop-blur-xl border-b border-white/5 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center w-full">
          {/* Status Indicator - Refined */}
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all cursor-default group">
            <div className="relative">
              <CheckCircle2 className="h-4 w-4 text-brand-emerald relative z-10" aria-hidden="true" />
              <div className="absolute inset-0 bg-brand-emerald/40 blur-sm rounded-full animate-pulse group-hover:scale-150 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">System Status</span>
              <span className="text-xs font-semibold text-brand-emerald">All nodes operational</span>
            </div>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-8 ms-auto">
            {/* Notification Button - Premium touch */}
            <button 
              className="relative p-2.5 text-gray-400 hover:text-white transition-all rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 group overflow-hidden"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-status-error ring-2 ring-[color:var(--background)] animate-pulse" aria-hidden="true" />
            </button>

            {/* Divider - Refined */}
            <div className="hidden lg:block lg:h-8 lg:w-px lg:bg-gradient-to-b lg:from-transparent lg:via-white/10 lg:to-transparent" aria-hidden="true" />

            {/* User Profile - Enhanced */}
            <div className="hidden sm:flex sm:items-center gap-4 px-1 py-1 pr-4 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-purple via-brand-blue to-brand-cyan flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-brand-blue/20 ring-1 ring-white/20 group-hover:ring-brand-cyan/50 transition-all group-hover:scale-105">
                {user?.companyName?.charAt(0) || "C"}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-100 group-hover:text-white transition-colors">
                  {user?.companyName || "Acme Corp"}
                </span>
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tighter">Premium Account</span>
              </div>
            </div>

            {/* Logout Button - Refined */}
            <button
              onClick={handleLogout}
              className="group flex items-center gap-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all focus-visible:ring-2 focus-visible:ring-accent ml-2"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile System Status - Shown only on mobile */}
      {sidebarOpen && (
        <div className="sm:hidden px-4 py-3 bg-status-success/5 border-b border-status-success/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden="true" />
          <span className="text-xs font-medium text-status-success">System Healthy</span>
        </div>
      )}
    </>
  );
}
