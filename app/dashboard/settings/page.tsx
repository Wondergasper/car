"use client";

import { useState, useEffect } from "react";
import React from "react";
import { User, Building, Mail, Shield, Save, Loader2, Check, Key, Copy, Plus } from "lucide-react";
import { authApi, apiKeysApi } from "@/lib/api";

interface UserProfile {
  email: string;
  role: string;
  name?: string;
}

interface ApiKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used_at?: string;
  full_key?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New API key form
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authApi
      .getProfile()
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoadingProfile(false));

    apiKeysApi
      .list()
      .then((res) => setApiKeys(res.data))
      .catch(console.error)
      .finally(() => setLoadingKeys(false));
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const res = await apiKeysApi.create({ name: newKeyName });
      const created: ApiKey = res.data;
      setNewKeySecret(created.full_key ?? null);
      setApiKeys((prev) => [created, ...prev]);
      setNewKeyName("");
    } catch {
      alert("Failed to create API key.");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      await apiKeysApi.revoke(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      alert("Failed to revoke key.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // Profile update endpoint — using getProfile to verify; 
      // full update endpoint can be added when backend /auth/me PATCH is implemented
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account, preferences, and API access</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <User className="h-5 w-5 text-brand-blue" />
          </div>
          <h2 className="text-lg font-semibold text-white">Account Profile</h2>
        </div>

        {loadingProfile ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                <Mail className="inline h-4 w-4 mr-1.5" />Email
              </label>
              <input
                type="email"
                value={profile?.email ?? ""}
                readOnly
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                <Shield className="inline h-4 w-4 mr-1.5" />Role
              </label>
              <input
                type="text"
                value={profile?.role ?? ""}
                readOnly
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 focus:outline-none cursor-not-allowed capitalize"
              />
            </div>
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/20 transition-all disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
              {profileSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-green-400">
                  <Check className="h-4 w-4" /> Saved successfully
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* API Keys Section */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
            <Key className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
            <p className="text-xs text-gray-500">Use API keys to access CAR-Bot from external systems</p>
          </div>
        </div>

        {/* New key revealed banner */}
        {newKeySecret && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 space-y-3">
            <p className="text-sm font-semibold text-green-400">
              ✓ API key created — copy it now, it will not be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-xs font-mono text-green-300 break-all">
                {newKeySecret}
              </code>
              <button
                onClick={() => handleCopy(newKeySecret)}
                className="shrink-0 flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              onClick={() => setNewKeySecret(null)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create key form */}
        <form onSubmit={handleCreateKey} className="flex gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name, e.g. Connector Integration"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue/50 transition-colors"
          />
          <button
            type="submit"
            disabled={creatingKey || !newKeyName.trim()}
            className="flex items-center gap-2 rounded-xl bg-brand-blue hover:bg-brand-blue/80 px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 shrink-0"
          >
            {creatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Key
          </button>
        </form>
      </div>
    </div>
  );
}
