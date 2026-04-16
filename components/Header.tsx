"use client";

import { Bell, LogOut, CheckCircle2, Menu } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useState } from "react";

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 sm:h-20 shrink-0 items-center gap-x-4 glass-panel border-b border-white/5 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center w-full">
          {/* Status Indicator - Hidden on mobile, shown on sm+ */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-success/10 border border-status-success/20">
            <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden="true" />
            <span className="text-xs font-medium text-status-success">System Healthy</span>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6 ms-auto">
            {/* Notification Button */}
            <button 
              className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-error animate-pulse" aria-hidden="true" />
            </button>

            {/* Divider - Hidden on mobile */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />

            {/* User Info - Hidden on small screens */}
            <div className="hidden sm:flex sm:items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-purple to-brand-blue flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-brand-blue/20">
                {user?.companyName?.charAt(0) || "C"}
              </div>
              <span className="text-sm font-semibold text-gray-200 truncate">
                {user?.companyName || "Acme Corp"}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-x-2 text-sm font-medium text-gray-400 hover:text-brand-cyan transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent ml-2 sm:ml-4"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile System Status - Shown only on mobile */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 py-3 bg-status-success/5 border-b border-status-success/20 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-status-success" aria-hidden="true" />
          <span className="text-xs font-medium text-status-success">System Healthy</span>
        </div>
      )}
    </>
  );
}
