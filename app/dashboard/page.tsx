"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ComplianceOverview from "@/components/ComplianceOverview";
import ConnectorsList from "@/components/ConnectorsList";
import RecentAudits from "@/components/RecentAudits";
import { connectorsApi, auditsApi } from "@/lib/api";

interface DashboardStats {
  complianceScore: string;
  activeConnectors: number;
  openFindings: number;
  pendingReports: number;
  loaded: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    complianceScore: "—",
    activeConnectors: 0,
    openFindings: 0,
    pendingReports: 0,
    loaded: false,
  });

  useEffect(() => {
    Promise.allSettled([connectorsApi.list(), auditsApi.list()]).then(
      ([connectorsResult, auditsResult]) => {
        const connectors =
          connectorsResult.status === "fulfilled" ? connectorsResult.value.data : [];
        const audits =
          auditsResult.status === "fulfilled" ? auditsResult.value.data : [];

        const activeConnectors = connectors.filter(
          (c: any) => c.status === "active"
        ).length;

        const completedAudits = audits.filter((a: any) => a.status === "completed");
        const latestScore =
          completedAudits.length > 0
            ? `${completedAudits[completedAudits.length - 1].compliance_score ?? "—"}%`
            : "—";

        const openFindings = audits.reduce(
          (sum: number, a: any) => sum + (a.findings_count ?? 0),
          0
        );

        const pendingReports = audits.filter(
          (a: any) => a.status === "in_progress" || a.status === "pending"
        ).length;

        setStats({
          complianceScore: latestScore,
          activeConnectors,
          openFindings,
          pendingReports,
          loaded: true,
        });
      }
    );
  }, []);

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

      {/* Live Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Compliance Score"
          value={stats.complianceScore}
          loading={!stats.loaded}
        />
        <StatCard
          title="Active Connectors"
          value={String(stats.activeConnectors)}
          loading={!stats.loaded}
        />
        <StatCard
          title="Total Findings"
          value={String(stats.openFindings)}
          loading={!stats.loaded}
        />
        <StatCard
          title="Pending Audits"
          value={String(stats.pendingReports)}
          loading={!stats.loaded}
        />
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
  loading,
}: {
  title: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }}
      className="glass-card p-6 rounded-2xl relative overflow-hidden group"
    >
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 rounded-full blur-2xl group-hover:bg-brand-cyan/20 transition-colors duration-500" />
      <p className="text-sm font-medium text-gray-400 relative z-10">{title}</p>
      {loading ? (
        <div className="mt-2 h-10 w-24 rounded bg-white/10 animate-pulse" />
      ) : (
        <p className="mt-2 text-4xl font-bold text-white tracking-tight relative z-10">{value}</p>
      )}
    </motion.div>
  );
}
