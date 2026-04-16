"use client";

import { Plus, Database, CheckCircle, AlertCircle, XCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const connectors = [
  { id: 1, name: "Customer DB", type: "PostgreSQL", status: "active", lastSync: "2 min ago" },
  { id: 2, name: "HR System", type: "REST API", status: "active", lastSync: "5 min ago" },
  { id: 3, name: "Transaction Log", type: "MongoDB", status: "error", lastSync: "1 hour ago" },
  { id: 4, name: "Email Server", type: "SMTP", status: "inactive", lastSync: "Never" },
];

const statusIcons: Record<string, any> = {
  active: CheckCircle,
  error: AlertCircle,
  inactive: XCircle,
};

const statusColors: Record<string, string> = {
  active: "text-green-400 bg-green-500/10 border-green-500/20",
  error: "text-red-400 bg-red-500/10 border-red-500/20",
  inactive: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

export default function ConnectorsList() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white">Data Connectors</h3>
          <p className="text-sm text-gray-400 mt-1">
            Manage your data source connections
          </p>
        </div>
        <button className="flex items-center gap-x-2 rounded-xl bg-brand-blue hover:bg-brand-blue/80 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/30 transition-all">
          <Plus className="h-4 w-4" />
          Add Connector
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {connectors.map((connector, i) => {
          const Icon = statusIcons[connector.status];
          return (
            <motion.div 
              key={connector.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                  <Database className="h-5 w-5 text-gray-300" />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${statusColors[connector.status]}`}>
                  <Icon className="h-3 w-3" />
                  <span className="capitalize">{connector.status}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-brand-cyan transition-colors">{connector.name}</h4>
                <p className="text-sm text-gray-500">{connector.type}</p>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="text-xs text-gray-500">
                  Sync: {connector.lastSync}
                </div>
                <button className="text-brand-cyan hover:text-brand-blue transition-colors flex items-center gap-1 text-sm font-medium">
                  Configure <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
