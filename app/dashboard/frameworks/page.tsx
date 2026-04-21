"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, CheckCircle2, AlertTriangle, XCircle,
  ChevronRight, Loader2, ArrowRight, FileText, RefreshCw,
} from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FrameworkSummary {
  id: string;
  name: string;
  version?: string;
  issuing_body?: string;
  control_count: number;
}

interface ControlItem {
  id: string;
  title: string;
  description?: string;
  evidence_requirements: string[];
  maps_to: string[];
}

interface CrosswalkItem {
  source: string;
  title: string;
  matched: string[];
}

const FW_STYLES: Record<string, { gradient: string; border: string; text: string; icon: string }> = {
  ndpa_2023:     { gradient: "from-blue-600/20 to-blue-800/5",   border: "border-blue-500/30", text: "text-blue-400",   icon: "🇳🇬" },
  gaid_2025:     { gradient: "from-purple-600/20 to-purple-800/5", border: "border-purple-500/30", text: "text-purple-400", icon: "📋" },
  cbn_framework: { gradient: "from-green-600/20 to-green-800/5", border: "border-green-500/30",  text: "text-green-400",  icon: "🏦" },
  ncc_framework: { gradient: "from-orange-600/20 to-orange-800/5", border: "border-orange-500/30", text: "text-orange-400", icon: "📡" },
};

const DEFAULT_STYLE = {
  gradient: "from-gray-600/20 to-gray-800/5",
  border: "border-gray-500/30",
  text: "text-gray-400",
  icon: "📄",
};

export default function FrameworksPage() {
  const [frameworks, setFrameworks] = useState<FrameworkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFw, setSelectedFw] = useState<string | null>(null);
  const [controls, setControls] = useState<ControlItem[]>([]);
  const [controlLoading, setControlLoading] = useState(false);
  const [crosswalk, setCrosswalk] = useState<CrosswalkItem[]>([]);
  const [cwFrom, setCwFrom] = useState("");
  const [cwTo, setCwTo] = useState("");
  const [cwLoading, setCwLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "controls" | "crosswalk">("overview");

  const token = () => localStorage.getItem("token") || "";

  useEffect(() => {
    axios
      .get(`${API}/api/frameworks/`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => setFrameworks(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadControls = async (fwId: string) => {
    setControlLoading(true);
    setControls([]);
    try {
      const r = await axios.get(`${API}/api/frameworks/${fwId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setControls(r.data.controls || []);
    } catch {}
    setControlLoading(false);
  };

  const selectFramework = (fwId: string) => {
    setSelectedFw(fwId === selectedFw ? null : fwId);
    if (fwId !== selectedFw) {
      setActiveTab("overview");
      loadControls(fwId);
    }
  };

  const loadCrosswalk = async () => {
    if (!cwFrom || !cwTo || cwFrom === cwTo) return;
    setCwLoading(true);
    setCrosswalk([]);
    try {
      const r = await axios.get(`${API}/api/frameworks/crosswalk/map`, {
        params: { from_fw: cwFrom, to_fw: cwTo },
        headers: { Authorization: `Bearer ${token()}` },
      });
      setCrosswalk(r.data.mappings || []);
    } catch {}
    setCwLoading(false);
  };

  const selectedDetail = frameworks.find((f) => f.id === selectedFw);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-brand-cyan flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Compliance <span className="text-gradient">Frameworks</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm ml-1">
          NDPA 2023 · GAID 2025 · CBN Cybersecurity · NCC Consumer Protection
        </p>
      </motion.div>

      {/* Framework cards */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {frameworks.map((fw, i) => {
            const style = FW_STYLES[fw.id] ?? DEFAULT_STYLE;
            const isSelected = selectedFw === fw.id;
            return (
              <motion.button
                key={fw.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => selectFramework(fw.id)}
                className={`text-left p-5 rounded-2xl border bg-gradient-to-b transition-all duration-200 ${style.gradient} ${style.border} ${
                  isSelected ? "ring-2 ring-brand-cyan/40 scale-[1.02]" : "hover:scale-[1.01]"
                }`}
              >
                <div className="text-3xl mb-3">{style.icon}</div>
                <p className={`font-bold text-base mb-0.5 ${style.text}`}>{fw.name}</p>
                <p className="text-xs text-gray-500 mb-3">{fw.issuing_body} · {fw.version}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    <span className="font-bold text-white">{fw.control_count}</span> controls
                  </span>
                  <ChevronRight className={`w-4 h-4 ${style.text} transition-transform ${isSelected ? "rotate-90" : ""}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {selectedFw && selectedDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6 pt-4">
              {(["overview", "controls", "crosswalk"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-brand-cyan text-brand-cyan"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview tab */}
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Framework", value: selectedDetail.name },
                      { label: "Version", value: selectedDetail.version || "N/A" },
                      { label: "Issuing Body", value: selectedDetail.issuing_body || "N/A" },
                      { label: "Controls", value: String(selectedDetail.control_count) },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/8">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("controls")}
                    className="flex items-center gap-2 text-sm text-brand-cyan hover:underline"
                  >
                    View all {selectedDetail.control_count} controls <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Controls tab */}
              {activeTab === "controls" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {controlLoading ? (
                    <div className="flex items-center gap-2 py-8 justify-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading controls…
                    </div>
                  ) : controls.length === 0 ? (
                    <p className="text-gray-500 text-sm py-8 text-center">
                      No controls available. Add framework JSON to app/core/frameworks/
                    </p>
                  ) : (
                    controls.map((ctrl, i) => (
                      <motion.div
                        key={ctrl.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded">
                                {ctrl.id}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white mb-1">{ctrl.title}</p>
                            {ctrl.description && (
                              <p className="text-xs text-gray-400 leading-relaxed">{ctrl.description}</p>
                            )}
                          </div>
                          <FileText className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
                        </div>

                        {ctrl.evidence_requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {ctrl.evidence_requirements.map((ev) => (
                              <span key={ev} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-gray-400 font-mono">
                                {ev}
                              </span>
                            ))}
                          </div>
                        )}

                        {ctrl.maps_to.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] text-gray-600">Maps to:</span>
                            {ctrl.maps_to.map((m) => (
                              <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/10 text-brand-cyan font-mono">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Crosswalk tab */}
              {activeTab === "crosswalk" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={cwFrom}
                      onChange={(e) => setCwFrom(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-cyan transition-all appearance-none"
                    >
                      <option value="">From framework…</option>
                      {frameworks.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <select
                      value={cwTo}
                      onChange={(e) => setCwTo(e.target.value)}
                      className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-cyan transition-all appearance-none"
                    >
                      <option value="">To framework…</option>
                      {frameworks.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <button
                      onClick={loadCrosswalk}
                      disabled={!cwFrom || !cwTo || cwLoading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue/20 border border-brand-blue/30 text-brand-cyan text-sm font-semibold hover:bg-brand-blue/30 disabled:opacity-40 transition-all"
                    >
                      {cwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Map Controls
                    </button>
                  </div>

                  {crosswalk.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">{crosswalk.length} control mappings found</p>
                      {crosswalk.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/4 border border-white/8"
                        >
                          <span className="text-xs font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-1 rounded flex-shrink-0">
                            {item.source}
                          </span>
                          <span className="text-sm text-gray-300 flex-1 min-w-0 truncate">{item.title}</span>
                          <ArrowRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
                          <div className="flex gap-1 flex-wrap">
                            {item.matched.map((m) => (
                              <span key={m} className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                {m}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {!cwLoading && crosswalk.length === 0 && cwFrom && cwTo && (
                    <p className="text-sm text-gray-500 py-6 text-center">
                      No crosswalk mappings found between these frameworks.
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
