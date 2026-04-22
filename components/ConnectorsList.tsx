"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus, Database, CheckCircle, AlertCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { connectorsApi } from "@/lib/api";

interface Connector {
  id: string;
  name: string;
  connector_type_id: string;
  status: "active" | "inactive" | "error" | "pending";
  health_status: string;
  last_sync_at: string | null;
  sync_enabled: boolean;
  sync_interval: number;
  created_at: string;
}

const statusIcons: Record<string, any> = {
  active: CheckCircle,
  error: AlertCircle,
  inactive: XCircle,
  pending: Loader2,
};

const statusColors: Record<string, string> = {
  active: "text-green-400 bg-green-500/10 border-green-500/20",
  error: "text-red-400 bg-red-500/10 border-red-500/20",
  inactive: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
};

function formatLastSync(lastSync: string | null): string {
  if (!lastSync) return "Never";
  const diff = Date.now() - new Date(lastSync).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

export default function ConnectorsList() {
  const { data: connectors = [], isLoading, error } = useQuery({
    queryKey: ["connectors"],
    queryFn: async () => {
      const res = await connectorsApi.list();
      return res.data;
    },
    staleTime: 30000,
  });

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/5 bg-white/[0.01]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Data <span className="text-gradient">Connectors</span></h3>
          <p className="text-sm text-gray-500 font-medium">Monitoring {connectors.length} active data pipelines</p>
        </div>
        <button 
          className="flex items-center gap-x-2 rounded-2xl bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-bold text-white border border-white/10 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Add Connector</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse h-44"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center py-12 px-4">
          <AlertCircle className="h-12 w-12 text-status-error mx-auto mb-4" aria-hidden="true" />
          <p className="text-red-400 font-bold">Connection Failure</p>
          <p className="text-sm text-gray-500 mt-1">Failed to reach the data orchestration layer.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && connectors.length === 0 && (
        <div className="text-center py-16 px-4 rounded-[2rem] border border-dashed border-white/5">
          <Database className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-bold text-lg">No pipelines discovered</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Connect your databases or APIs to start continuous compliance tracking.</p>
        </div>
      )}

      {/* Connectors Grid */}
      {!isLoading && !error && connectors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {connectors.map((connector: Connector, i: number) => {
            const status = connector.status ?? "inactive";
            const Icon = statusIcons[status] ?? XCircle;
            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-brand-cyan/20 transition-all relative group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-cyan/40 transition-all">
                    <Database className="h-6 w-6 text-brand-cyan" aria-hidden="true" />
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase ${statusColors[status]}`}>
                    <Icon className="h-3 w-3" />
                    <span>{status}</span>
                  </div>
                </div>

                {/* Connector Info */}
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-brand-cyan transition-colors truncate">
                    {connector.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium truncate mt-1">{connector.health_status}</p>
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-5">
                  <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    Last: {formatLastSync(connector.last_sync_at)}
                  </div>
                  <button 
                    className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-brand-cyan hover:border-brand-cyan/30 transition-all"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
