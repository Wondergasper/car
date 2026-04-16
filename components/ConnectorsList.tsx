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
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white">Data Connectors</h3>
          <p className="text-sm text-gray-400 mt-1">Manage your data source connections</p>
        </div>
        <button className="flex items-center gap-x-2 rounded-xl bg-brand-blue hover:bg-brand-blue/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/30 transition-all">
          <Plus className="h-4 w-4" />
          Add Connector
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse h-40" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-red-400 text-center py-8">{error}</p>
      )}

      {!loading && !error && connectors.length === 0 && (
        <div className="text-center py-12">
          <Database className="h-10 w-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No connectors yet</p>
          <p className="text-sm text-gray-600 mt-1">Add a connector to start scanning data sources.</p>
        </div>
      )}

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
                className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <Database className="h-5 w-5 text-gray-300" />
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[status]}`}>
                    <Icon className="h-3 w-3" />
                    <span className="capitalize">{status}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">
                    {connector.name}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">{connector.health_status}</p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="text-xs text-gray-500">
                    Sync: {formatLastSync(connector.last_sync_at)}
                  </div>
                  <button className="text-brand-cyan hover:text-brand-blue transition-colors flex items-center gap-1 text-sm font-medium">
                    Configure <ArrowRight className="h-4 w-4" />
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
