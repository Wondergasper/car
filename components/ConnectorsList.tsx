"use client";

import { useEffect, useState } from "react";
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
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    connectorsApi
      .list()
      .then((res) => setConnectors(res.data))
      .catch(() => setError("Failed to load connectors."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass-card rounded-xl sm:rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">Data Connectors</h3>
          <p className="text-sm text-gray-400 mt-1">Manage your data source connections</p>
        </div>
        <button 
          className="flex items-center gap-x-2 rounded-xl bg-brand-blue hover:bg-brand-blue/80 active:bg-brand-blue/70 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/30 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background w-full sm:w-auto justify-center sm:justify-start"
          aria-label="Add a new connector"
          title="Add Connector"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Connector</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse h-40 aria-busy"
              role="status"
              aria-label="Loading connector"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="text-center py-12 px-4">
          <AlertCircle className="h-12 w-12 text-status-error mx-auto mb-4" aria-hidden="true" />
          <p className="text-sm sm:text-base text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && connectors.length === 0 && (
        <div className="text-center py-12 px-4">
          <Database className="h-12 w-12 text-gray-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-400 font-medium">No connectors yet</p>
          <p className="text-sm text-gray-600 mt-1">Add a connector to start scanning data sources.</p>
        </div>
      )}

      {/* Connectors Grid */}
      {!loading && !error && connectors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {connectors.map((connector, i) => {
            const status = connector.status ?? "inactive";
            const Icon = statusIcons[status] ?? XCircle;
            return (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all relative group focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent focus-within:ring-offset-background"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                    <Database className="h-5 w-5 text-gray-300" aria-hidden="true" />
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[status]}`}>
                    <Icon className="h-3 w-3" aria-hidden="true" />
                    <span className="capitalize">{status}</span>
                  </div>
                </div>

                {/* Connector Info */}
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">
                    {connector.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">{connector.health_status}</p>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Sync:</span> {formatLastSync(connector.last_sync_at)}
                  </div>
                  <button 
                    className="text-brand-cyan hover:text-brand-blue transition-colors flex items-center gap-1 text-xs sm:text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:ring-offset-background rounded"
                    aria-label={`Configure ${connector.name}`}
                    title="Configure"
                  >
                    Configure <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
