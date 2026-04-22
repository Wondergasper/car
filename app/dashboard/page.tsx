"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ComplianceOverview from "@/components/ComplianceOverview";
import ConnectorsList from "@/components/ConnectorsList";
import RecentAudits from "@/components/RecentAudits";
import { dashboardApi } from "@/lib/api";
import { Shield, Database, AlertCircle, Clock, FileSearch, TriangleAlert } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await dashboardApi.getStats();
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30s
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="space-y-6 sm:space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          System <span className="text-brand-cyan">Overview</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Real-time compliance monitoring and data governance dashboard.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Compliance Score"
          value={stats?.compliance_score !== null ? `${stats?.compliance_score}%` : "—"}
          loading={isLoading}
          icon={Shield}
          color="text-brand-cyan"
        />
        <StatCard
          title="Active Connectors"
          value={String(stats?.active_connectors ?? 0)}
          loading={isLoading}
          icon={Database}
          color="text-brand-purple"
        />
        <StatCard
          title="Total Findings"
          value={String(stats?.total_findings ?? 0)}
          loading={isLoading}
          icon={AlertCircle}
          color="text-status-error"
        />
        <StatCard
          title="Pending Audits"
          value={String(stats?.pending_audits ?? 0)}
          loading={isLoading}
          icon={Clock}
          color="text-brand-blue"
        />
        <StatCard
          title="Analyzed Docs"
          value={String(stats?.analyzed_documents ?? 0)}
          loading={isLoading}
          icon={FileSearch}
          color="text-brand-cyan"
        />
        <StatCard
          title="High-Risk Docs"
          value={String(stats?.high_risk_documents ?? 0)}
          loading={isLoading}
          icon={TriangleAlert}
          color="text-status-error"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ComplianceOverview />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RecentAudits />
        </motion.div>
      </div>

      {/* Connectors Section */}
      <motion.div variants={itemVariants}>
        <ConnectorsList />
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  loading,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  loading?: boolean;
  icon: any;
  color: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
      className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] relative overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-xl"
    >
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-brand-cyan/10 transition-all duration-500" />
      
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-white/10 animate-pulse rounded-lg mt-1" />
            ) : (
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            )}
        </div>
      </div>
    </motion.div>
  );
}
