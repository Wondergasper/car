"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock, Plus, Trash2, Loader2, AlertCircle,
  Clock, CheckCircle, Play, X, Check,
} from "lucide-react";
import { scheduledAuditsApi } from "@/lib/api";

interface ScheduledAudit {
  id: string;
  name: string;
  cron_expression: string;
  is_active: boolean;
  created_at: string;
  next_run: string | null;
}

const CRON_PRESETS = [
  { label: "Every Monday at 8am", cron: "0 8 * * 1" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Every Sunday at 2am", cron: "0 2 * * 0" },
  { label: "First of every month", cron: "0 9 1 * *" },
  { label: "Every weekday at 9am", cron: "0 9 * * 1-5" },
];

function parseCronLabel(cron: string): string {
  const preset = CRON_PRESETS.find((p) => p.cron === cron);
  return preset ? preset.label : cron;
}

export default function ScheduledAuditsPage() {
  const [schedules, setSchedules] = useState<ScheduledAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", cron_expression: "0 8 * * 1", usePreset: true });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = () => {
    setLoading(true);
    scheduledAuditsApi.list()
      .then((res) => setSchedules(res.data))
      .catch(() => setError("Failed to load schedules."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      await scheduledAuditsApi.create({ name: form.name, cron_expression: form.cron_expression });
      load();
      setShowCreate(false);
      setForm({ name: "", cron_expression: "0 8 * * 1", usePreset: true });
    } catch (e: any) {
      setCreateError(e?.response?.data?.detail || "Failed to create schedule.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete schedule "${name}"?`)) return;
    try {
      await scheduledAuditsApi.delete(id);
      load();
    } catch {
      alert("Failed to delete schedule.");
    }
  };

  const formatNextRun = (iso: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-white" />
            </div>
            Scheduled Audits
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Automate compliance audits on a recurring schedule</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,223,216,0.3)] transition-all">
          <Plus className="h-4 w-4" /> New Schedule
        </button>
      </motion.div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Scheduled Audit</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Audit Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Weekly NDPA Compliance Check"
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block">Schedule</label>
                <div className="grid grid-cols-1 gap-2">
                  {CRON_PRESETS.map((p) => (
                    <button type="button" key={p.cron}
                      onClick={() => setForm((f) => ({ ...f, cron_expression: p.cron, usePreset: true }))}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                        form.cron_expression === p.cron
                          ? "border-brand-cyan/40 bg-brand-cyan/10 text-white"
                          : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}>
                      <span>{p.label}</span>
                      <code className="text-xs font-mono text-gray-500">{p.cron}</code>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs text-gray-500 mb-1.5 block">Or enter custom cron expression</label>
                  <input value={form.cron_expression}
                    onChange={(e) => setForm((f) => ({ ...f, cron_expression: e.target.value, usePreset: false }))}
                    placeholder="0 8 * * 1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-cyan/40" />
                </div>
              </div>
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Create Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Schedules Grid */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
        </div>
      )}
      {error && (
        <div className="text-center py-16">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {!loading && !error && schedules.length === 0 && (
        <div className="glass-card rounded-2xl border border-white/5 flex flex-col items-center justify-center py-20 text-center">
          <CalendarClock className="h-12 w-12 text-gray-600 mb-4" />
          <p className="text-white font-semibold mb-1">No schedules yet</p>
          <p className="text-gray-500 text-sm">Create your first automated audit schedule to run audits hands-free.</p>
        </div>
      )}
      {!loading && !error && schedules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {schedules.map((s) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-5 border border-white/5 group hover:border-brand-cyan/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
                  <Play className="h-5 w-5 text-brand-purple" />
                </div>
                <button onClick={() => handleDelete(s.id, s.name)}
                  className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-white font-semibold mb-1 truncate">{s.name}</h3>
              <p className="text-xs text-gray-500 mb-4">{parseCronLabel(s.cron_expression)}</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Next run</span>
                  <span className="text-gray-300 font-medium">{formatNextRun(s.next_run)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Status</span>
                  <span className={`flex items-center gap-1 font-medium ${s.is_active ? "text-green-400" : "text-gray-500"}`}>
                    <CheckCircle className="h-3 w-3" /> {s.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500 font-mono">
                  <span>Cron</span>
                  <code className="text-brand-cyan">{s.cron_expression}</code>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
