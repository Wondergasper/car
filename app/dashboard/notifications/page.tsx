"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell, Webhook, Plus, Trash2, Loader2, AlertCircle,
  CheckCircle2, X, Check, Globe, Zap,
} from "lucide-react";
import { notificationsApi } from "@/lib/api";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

const AVAILABLE_EVENTS = [
  { value: "audit.completed", label: "Audit Completed", icon: CheckCircle2, color: "text-green-400" },
  { value: "finding.critical", label: "Critical Finding", icon: Zap, color: "text-red-400" },
];

export default function NotificationsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", events: ["audit.completed", "finding.critical"] });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const load = () => {
    setLoading(true);
    notificationsApi.listWebhooks()
      .then((res) => setWebhooks(res.data))
      .catch(() => setError("Failed to load webhooks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleEvent = (evt: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(evt) ? f.events.filter((e) => e !== evt) : [...f.events, evt],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.events.length === 0) { setCreateError("Select at least one event."); return; }
    setCreating(true);
    setCreateError("");
    try {
      await notificationsApi.createWebhook(form);
      load();
      setShowCreate(false);
      setForm({ name: "", url: "", events: ["audit.completed", "finding.critical"] });
    } catch (e: any) {
      setCreateError(e?.response?.data?.detail || "Failed to create webhook.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete webhook "${name}"?`)) return;
    try {
      await notificationsApi.deleteWebhook(id);
      load();
    } catch { alert("Failed to delete webhook."); }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Configure email alerts and outgoing webhook integrations</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,223,216,0.3)] transition-all">
          <Plus className="h-4 w-4" /> Add Webhook
        </button>
      </motion.div>

      {/* Email Alert Info Banner */}
      <div className="glass-card rounded-2xl p-5 border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-4">
        <Bell className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-medium text-sm">Email Alerts (Auto-configured)</p>
          <p className="text-gray-400 text-xs mt-1">
            Your DPO email will automatically receive alerts when audits complete or critical findings are detected.
            Configure your DPO email in <span className="text-brand-cyan cursor-pointer hover:underline">Organization Settings</span>.
          </p>
        </div>
      </div>

      {/* Create Webhook Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Register Webhook</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Slack Alert"
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Endpoint URL</label>
                <input required type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 font-mono" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 block">Events to Send</label>
                <div className="space-y-2">
                  {AVAILABLE_EVENTS.map((evt) => {
                    const Icon = evt.icon;
                    const selected = form.events.includes(evt.value);
                    return (
                      <button type="button" key={evt.value} onClick={() => toggleEvent(evt.value)}
                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                          selected ? "border-brand-cyan/40 bg-brand-cyan/10 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}>
                        <Icon className={`h-4 w-4 ${evt.color}`} />
                        <span>{evt.label}</span>
                        {selected && <CheckCircle2 className="h-4 w-4 text-brand-cyan ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              {createError && <p className="text-sm text-red-400">{createError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Register
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Webhook List */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <Globe className="h-5 w-5 text-brand-cyan" />
          <h2 className="text-white font-semibold">Outgoing Webhooks</h2>
          <span className="ml-auto text-xs text-gray-500">{webhooks.length} registered</span>
        </div>
        {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-brand-cyan" /></div>}
        {error && <div className="text-center py-12"><AlertCircle className="h-7 w-7 text-red-400 mx-auto mb-2" /><p className="text-red-400 text-sm">{error}</p></div>}
        {!loading && !error && webhooks.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No webhooks registered</p>
            <p className="text-gray-500 text-xs mt-1">Add a webhook to receive real-time event payloads.</p>
          </div>
        )}
        {!loading && !error && webhooks.map((wh) => (
          <div key={wh.id} className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <Globe className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{wh.name}</p>
              <p className="text-gray-500 text-xs font-mono truncate mt-0.5">{wh.url}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {wh.events.map((e) => (
                  <span key={e} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <span className="flex items-center gap-1 text-green-400 text-xs font-medium flex-shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" /> Active
            </span>
            <button onClick={() => handleDelete(wh.id, wh.name)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100 flex-shrink-0">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
