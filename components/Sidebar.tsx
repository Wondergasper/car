"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plug,
  FileText,
  Shield,
  Settings,
  BookOpen,
  Send,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Connectors", href: "/dashboard/connectors", icon: Plug },
  { name: "Audit Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Compliance Rules", href: "/dashboard/rules", icon: Shield },
  { name: "Document Studio", href: "/dashboard/studio", icon: BookOpen },
  { name: "Filing Portal", href: "/dashboard/filing", icon: Send },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto glass-panel border-r border-white/5 py-6">
        {/* Logo Section */}
        <div className="flex shrink-0 items-center px-6 gap-3 focus-within:outline-none">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center shadow-lg shadow-brand-blue/20">
            <Shield className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">CAR-Bot</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col px-4 mt-6">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group relative flex items-center gap-x-3 rounded-xl p-3 text-sm font-medium transition-all duration-300
                      focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-accent
                      ${
                        isActive
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
                        isActive 
                          ? 'text-brand-cyan' 
                          : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="z-10">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Info */}
        <div className="px-6 py-4 border-t border-white/5">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-400">Version</span> 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
