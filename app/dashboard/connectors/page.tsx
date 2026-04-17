"use client";

import { useState } from "react";
import { Plus, X, Database, Key, Globe, Shield } from "lucide-react";

const connectorTypes = [
  { id: "postgresql", name: "PostgreSQL", icon: Database, description: "Connect to PostgreSQL database" },
  { id: "mongodb", name: "MongoDB", icon: Database, description: "Connect to MongoDB database" },
  { id: "rest-api", name: "REST API", icon: Globe, description: "Connect via REST API" },
  { id: "oauth", name: "OAuth Provider", icon: Key, description: "Connect via OAuth/OIDC" },
  { id: "custom", name: "Custom Integration", icon: Shield, description: "Use our SDK for custom integration" },
];

export default function ConnectorsPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Data Connectors</h1>
          <p className="text-gray-400 mt-1">
            Connect your data sources for continuous compliance monitoring
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-x-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/80 shadow-lg shadow-brand-blue/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Connector
        </button>
      </div>

      {/* Connector Types Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {connectorTypes.map((type) => (
          <div
            key={type.id}
            className="glass-card rounded-2xl p-6 transition-all hover:border-brand-blue/40 hover:bg-white/[0.04] cursor-pointer group"
            onClick={() => {
              setSelectedType(type.id);
              setShowModal(true);
            }}
          >
            <div className="h-12 w-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
              <type.icon className="h-6 w-6 text-brand-blue" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-brand-cyan transition-colors">{type.name}</h3>
            <p className="mt-2 text-sm text-gray-400">{type.description}</p>
          </div>
        ))}
      </div>

      {/* Add Connector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-blue/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-bold text-white">Add New Connector</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Connector Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-blue focus:outline-none transition-colors"
                  placeholder="e.g., Production Database"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Connection String</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-blue focus:outline-none transition-colors"
                  placeholder="postgresql://user:pass@host:5432/db"
                />
              </div>
              <div className="flex justify-end gap-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-blue/80 shadow-lg shadow-brand-blue/20 transition-colors"
                >
                  Save Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
