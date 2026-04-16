"use client";

import { motion } from "framer-motion";
import ComplianceOverview from "@/components/ComplianceOverview";
import ConnectorsList from "@/components/ConnectorsList";
import RecentAudits from "@/components/RecentAudits";

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Overview</h1>
          <p className="text-gray-400">Welcome back. Here is the latest state of your compliance.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Compliance Score" value="87%" trend="+5%" positive />
        <StatCard title="Active Connectors" value="12" trend="+2" positive />
        <StatCard title="Open Findings" value="23" trend="-8" positive />
        <StatCard title="Pending Reports" value="3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ComplianceOverview />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RecentAudits />
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <ConnectorsList />
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  trend,
  positive,
}: {
  title: string;
  value: string;
  trend?: string;
  positive?: boolean;
}) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 rounded-full blur-2xl group-hover:bg-brand-cyan/20 transition-colors duration-500"></div>
      <p className="text-sm font-medium text-gray-400 relative z-10">{title}</p>
      <p className="mt-2 text-4xl font-bold text-white tracking-tight relative z-10">{value}</p>
      {trend && (
        <div className="mt-4 flex items-center gap-2 relative z-10">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
              positive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {positive ? "↑" : "↓"} {trend}
          </span>
          <span className="text-xs text-gray-500">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
