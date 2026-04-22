"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Database, Globe, Shield, Loader2, CheckCircle2, Trash2, ArrowRight } from "lucide-react";
import { connectorsApi } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons: Record<string, any> = {
  database: Database,
  api: Globe,
  cloud_app: Shield,
};

type ConfigProperty = {
  type?: string;
  title?: string;
  description?: string;
  format?: string;
  enum?: string[];
  default?: any;
};

function getDefaultValue(prop: ConfigProperty) {
  if (prop.default !== undefined) return prop.default;
  if (prop.type === "boolean") return false;
  if (prop.type === "array") return [];
  if (prop.type === "object") return {};
  return "";
}

function formatFieldValue(value: unknown, prop: ConfigProperty) {
  if (value === undefined || value === null) {
    if (prop.type === "array" || prop.type === "object") {
      return JSON.stringify(getDefaultValue(prop), null, 2);
    }
    return "";
  }

  if (prop.type === "array" || prop.type === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default function ConnectorsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [connectorName, setConnectorName] = useState("");

  const { data: connectors = [], isLoading: loadingConnectors } = useQuery({
    queryKey: ["connectors"],
    queryFn: async () => {
      const res = await connectorsApi.list();
      return res.data;
    },
  });

  const { data: types = [] } = useQuery({
    queryKey: ["connector-types"],
    queryFn: async () => {
      const res = await connectorsApi.listTypes();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => connectorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
      toast.success("Connector created successfully");
      setShowModal(false);
      setConnectorName("");
      setFormData({});
      setSelectedType(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to create connector");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => connectorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connectors"] });
      toast.success("Connector deleted");
    },
  });

  const openTypeForm = (type: any) => {
    setSelectedType(type);
    setFormData(
      Object.fromEntries(
        Object.entries(type.config_schema.properties || {}).map(([key, prop]) => [
          key,
          getDefaultValue(prop as ConfigProperty),
        ])
      )
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectorName || !selectedType) return;

    const invalidJsonField = Object.entries(selectedType.config_schema.properties || {}).find(([key, prop]) => {
      const property = prop as ConfigProperty;
      return (property.type === "array" || property.type === "object") && typeof formData[key] === "string";
    });

    if (invalidJsonField) {
      toast.error(`"${invalidJsonField[0]}" must be valid JSON before saving`);
      return;
    }

    createMutation.mutate({
      name: connectorName,
      connector_type_id: selectedType.id,
      config: formData,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Data <span className="text-gradient">Connectors</span>
          </h1>
          <p className="text-gray-400 mt-2 text-base font-medium">
            Manage your organization&apos;s data pipelines and external compliance sources.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold text-sm shadow-xl hover:shadow-brand-blue/30 transition-all active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Add New Source
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Sources</p>
          <p className="text-3xl font-bold text-white">{connectors.length}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Active Sync</p>
          <p className="text-3xl font-bold text-brand-emerald">{connectors.filter((c: any) => c.status === "active").length}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Errors</p>
          <p className="text-3xl font-bold text-status-error">{connectors.filter((c: any) => c.status === "error").length}</p>
        </div>
      </div>

      {loadingConnectors ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-cyan" />
          <p className="text-gray-500 font-medium">Calibrating data channels...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {connectors.map((connector: any) => {
              const type = types.find((t: any) => t.id === connector.connector_type_id);
              const Icon = categoryIcons[type?.category] || Database;

              return (
                <motion.div
                  key={connector.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <button
                      onClick={() => deleteMutation.mutate(connector.id)}
                      className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-cyan/40 transition-all">
                      <Icon className="h-7 w-7 text-brand-cyan" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-brand-cyan transition-colors">{connector.name}</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{type?.name || "Unknown Type"}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Status</span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          connector.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/10 text-gray-400"
                        }`}
                      >
                        {connector.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Health</span>
                      <span className="text-gray-300 font-medium flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${connector.health_status === "healthy" ? "bg-emerald-400" : "bg-amber-400"}`} />
                        {connector.health_status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                      Last Sync: {connector.last_sync_at ? new Date(connector.last_sync_at).toLocaleTimeString() : "Never"}
                    </div>
                    <button className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/40 transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <button
            onClick={() => setShowModal(true)}
            className="p-6 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-brand-cyan/30 bg-white/[0.01] hover:bg-brand-cyan/[0.02] transition-all flex flex-col items-center justify-center space-y-4 group min-h-[220px]"
          >
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-all">
              <Plus className="h-8 w-8 text-gray-500 group-hover:text-brand-cyan" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest group-hover:text-gray-300">New Connection</p>
          </button>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-gray-900/90 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {!selectedType ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Select Connector Type</h2>
                    <p className="text-sm text-gray-400">Choose a data source to begin continuous compliance monitoring.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {types.map((type: any) => {
                      const Icon = categoryIcons[type.category] || Database;
                      return (
                        <button
                          key={type.id}
                          onClick={() => openTypeForm(type)}
                          className="p-5 text-left rounded-3xl bg-white/5 border border-white/5 hover:border-brand-cyan/40 hover:bg-white/10 transition-all group"
                        >
                          <Icon className="h-8 w-8 text-brand-cyan mb-4 group-hover:scale-110 transition-all" />
                          <p className="text-white font-bold">{type.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{type.category}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setSelectedType(null)}
                      className="text-gray-500 hover:text-brand-cyan text-xs font-bold uppercase tracking-widest"
                    >
                      {"<- Back to types"}
                    </button>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Configure {selectedType.name}</h2>
                    <p className="text-sm text-gray-400">{selectedType.description}</p>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Instance Name</label>
                      <input
                        required
                        value={connectorName}
                        onChange={(e) => setConnectorName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm focus:border-brand-cyan focus:outline-none transition-all"
                        placeholder="e.g. Production PostgreSQL"
                      />
                    </div>

                    {Object.keys(selectedType.config_schema.properties).map((key) => {
                      const prop = selectedType.config_schema.properties[key] as ConfigProperty;
                      const isRequired = selectedType.config_schema.required?.includes(key);

                      return (
                        <div key={key} className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {prop.title || key} {isRequired && "*"}
                          </label>

                          {prop.enum ? (
                            <select
                              required={isRequired}
                              value={formData[key] ?? getDefaultValue(prop)}
                              onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm focus:border-brand-cyan focus:outline-none transition-all"
                            >
                              {prop.enum.map((option) => (
                                <option key={option} value={option} className="bg-gray-900 text-white">
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : prop.type === "boolean" ? (
                            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white">
                              <span>{prop.description || "Enable this option"}</span>
                              <input
                                type="checkbox"
                                checked={Boolean(formData[key])}
                                onChange={(e) => setFormData((prev) => ({ ...prev, [key]: e.target.checked }))}
                                className="h-4 w-4 rounded border-white/20 bg-transparent accent-cyan-400"
                              />
                            </label>
                          ) : prop.type === "array" || prop.type === "object" ? (
                            <textarea
                              required={isRequired}
                              rows={4}
                              value={formatFieldValue(formData[key], prop)}
                              onChange={(e) => {
                                const rawValue = e.target.value;
                                setFormData((prev) => {
                                  try {
                                    return { ...prev, [key]: rawValue.trim() ? JSON.parse(rawValue) : getDefaultValue(prop) };
                                  } catch {
                                    return { ...prev, [key]: rawValue };
                                  }
                                });
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm focus:border-brand-cyan focus:outline-none transition-all font-mono"
                              placeholder={prop.type === "array" ? '["csv", "json"]' : '{"Authorization":"Bearer ..."}'}
                            />
                          ) : (
                            <input
                              required={isRequired}
                              type={prop.format === "password" ? "password" : prop.type === "integer" ? "number" : "text"}
                              value={formData[key] ?? ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [key]: prop.type === "integer" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                                }))
                              }
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm focus:border-brand-cyan focus:outline-none transition-all"
                              placeholder={prop.description || ""}
                            />
                          )}

                          {prop.description && prop.type !== "boolean" && (
                            <p className="text-xs text-gray-500">{prop.description}</p>
                          )}
                          {(prop.type === "array" || prop.type === "object") && typeof formData[key] === "string" && (
                            <p className="text-xs text-amber-400">Enter valid JSON to save this field correctly.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-bold shadow-xl hover:shadow-brand-blue/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Save Integration
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
