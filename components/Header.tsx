"use client";

import { Bell, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function Header() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        <button className="relative p-2 text-gray-400 hover:text-gray-500">
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-x-4">
          <div className="hidden sm:flex sm:items-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.companyName || "Company"}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <button
            onClick={logout}
            className="flex items-center gap-x-2 text-sm text-gray-700 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
