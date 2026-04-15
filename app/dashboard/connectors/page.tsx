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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Connectors</h1>
          <p className="text-gray-500 mt-1">
            Connect your data sources for continuous compliance monitoring
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          Add Connector
        </button>
      </div>

      {/* Connector Types Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connectorTypes.map((type) => (
          <div
            key={type.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-primary-500 cursor-pointer transition-colors"
            onClick={() => {
              setSelectedType(type.id);
              setShowModal(true);
            }}
          >
            <type.icon className="h-8 w-8 text-primary-600" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{type.name}</h3>
            <p className="mt-2 text-sm text-gray-500">{type.description}</p>
          </div>
        ))}
      </div>

      {/* Add Connector Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Connector</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Connector Name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  placeholder="e.g., Production Database"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Connection String</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  placeholder="postgresql://user:pass@host:5432/db"
                />
              </div>
              <div className="flex justify-end gap-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
                >
                  Add Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
