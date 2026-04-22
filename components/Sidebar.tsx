"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Plug,
  FileText,
  Shield,
  Settings,
  BookOpen,
  Send,
  Users,
  MessageSquare,
  CalendarClock,
  Bell,
  Layers,
  Search,
  Cpu,
  FolderOpen,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { name: "Documents", href: "/dashboard/documents", icon: FolderOpen },
  { name: "Audit Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Compliance Rules", href: "/dashboard/rules", icon: Shield },
  { name: "Document Studio", href: "/dashboard/studio", icon: BookOpen },
  { name: "Filing Portal", href: "/dashboard/filing", icon: Send },
];

const intelligenceNavigation = [
  { name: "AI Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Clause Explorer", href: "/dashboard/clauses", icon: Search },
  { name: "Frameworks", href: "/dashboard/frameworks", icon: Layers },
  { name: "Data Analysis", href: "/dashboard/analysis", icon: Cpu },
];

const secondaryNavigation = [
  { name: "Schedule Audits", href: "/dashboard/scheduled", icon: CalendarClock },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];


import { useUIStore } from "@/lib/store";
import { systemApi } from "@/lib/api";
import { X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { data: health } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => (await systemApi.health()).data,
    refetchInterval: 30000,
    retry: 1,
  });

  const statusLabel = health?.status === "healthy"
    ? `v${health.version ?? "2.0.0"} · ${health.rag_ready ? "RAG Ready" : "RAG Offline"}`
    : `v${health?.version ?? "2.0.0"} · Degraded`;
  const statusDotClass = health?.status === "healthy" ? "bg-brand-emerald" : "bg-amber-400";

  const renderNavItem = (item: { name: string; href: string; icon: any }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <li key={item.name}>
        <Link
          href={item.href}
          onClick={() => setSidebarOpen(false)}
          className={`
            group relative flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-300
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent
            ${isActive
              ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
              : "text-gray-400 hover:text-white hover:bg-white/5"
            }
          `}
          aria-current={isActive ? "page" : undefined}
        >
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-blue/20 to-transparent opacity-50 pointer-events-none"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-hidden="true"
            />
          )}
          <Icon
            className={`h-5 w-5 shrink-0 z-10 transition-colors ${
              isActive ? "text-brand-cyan" : "text-gray-500 group-hover:text-gray-300"
            }`}
            aria-hidden="true"
          />
          <span className="z-10">{item.name}</span>
        </Link>
      </li>
    );
  };

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-background/80 backdrop-blur-xl border-r border-white/5 py-8 h-full shadow-2xl relative">
      {/* Decorative background glow */}
      <div className="absolute top-0 -left-10 w-40 h-40 bg-brand-blue/10 rounded-full blur-[80px] -z-10" />
      <div className="absolute bottom-0 -right-10 w-40 h-40 bg-brand-purple/10 rounded-full blur-[80px] -z-10" />

      {/* Logo Section */}
      <div className="flex shrink-0 items-center px-8 gap-3 focus-within:outline-none justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple flex items-center justify-center shadow-lg shadow-brand-blue/30 group-hover:shadow-brand-blue/50 transition-all duration-500 group-hover:rotate-6">
            <Shield className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-brand-cyan transition-colors">CAR-Bot</span>
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em] -mt-1">Compliance AI</span>
          </div>
        </Link>
        <button
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      
      {/* Search mock or some interactive element could go here */}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-4 mt-4 space-y-6">
        {/* Primary Nav */}
        <div>
          <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600/80">
            Audit Engine
          </p>
          <ul role="list" className="flex flex-col gap-y-1.5">
            {navigation.map(renderNavItem)}
          </ul>
        </div>

        {/* Intelligence Nav */}
        <div>
          <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600/80 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-brand-cyan" />
            Intelligence
          </p>
          <ul role="list" className="flex flex-col gap-y-1.5">
            {intelligenceNavigation.map(renderNavItem)}
          </ul>
        </div>

        {/* Secondary Nav */}
        <div>
          <p className="px-4 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600/80">
            Workspace
          </p>
          <ul role="list" className="flex flex-col gap-y-1.5">
            {secondaryNavigation.map(renderNavItem)}
          </ul>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="px-8 mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Status</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${statusDotClass}`} />
              <span className="text-xs font-medium text-gray-400">{statusLabel}</span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
             <Settings className="h-4 w-4 text-gray-500 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 max-w-full flex h-full shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}

