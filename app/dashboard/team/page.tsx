"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, Trash2, Crown, Shield, Eye, Database,
  Loader2, AlertCircle, ChevronDown, X, Check,
} from "lucide-react";
import { usersApi } from "@/lib/api";

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: "owner" | "admin" | "dpo" | "analyst" | "viewer";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const roleConfig: Record<string, { label: string; icon: any; color: string }> = {
  owner: { label: "Owner", icon: Crown, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  admin: { label: "Admin", icon: Shield, color: "text-brand-blue bg-brand-blue/10 border-brand-blue/20" },
  dpo: { label: "DPO", icon: Shield, color: "text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20" },
  analyst: { label: "Analyst", icon: Database, color: "text-brand-purple bg-brand-purple/10 border-brand-purple/20" },
  viewer: { label: "Viewer", icon: Eye, color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
};

const ROLES = ["owner", "admin", "dpo", "analyst", "viewer"];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", full_name: "", role: "viewer" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const load = () => {
    setLoading(true);
    usersApi.list()
      .then((res) => setMembers(res.data))
      .catch(() => setError("Failed to load team members."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    try {
      await usersApi.invite(inviteForm);
      load();
      setShowInvite(false);
      setInviteForm({ email: "", full_name: "", role: "viewer" });
    } catch (e: any) {
      setInviteError(e?.response?.data?.detail || "Failed to invite user.");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await usersApi.updateRole(userId, newRole);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to update role.");
    }
  };

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will lose access immediately.`)) return;
    try {
      await usersApi.deactivate(userId);
      load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to deactivate user.");
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-cyan flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            Team Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Invite and manage your organization&apos;s team members</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(0,223,216,0.3)] transition-all"
        >
          <UserPlus className="h-4 w-4" /> Invite Member
        </button>
      </motion.div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-md border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
              <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                <input
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  required type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@company.com"
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
                  className="mt-1.5 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40"
                >
                  {ROLES.filter((r) => r !== "owner").map((r) => (
                    <option key={r} value={r} className="bg-gray-900 capitalize">{r.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              {inviteError && <p className="text-sm text-red-400">{inviteError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInvite(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={inviting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Send Invite
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Members Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
          </div>
        )}
        {error && (
          <div className="text-center py-16">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        {!loading && !error && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Login</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map((member) => {
                const roleCfg = roleConfig[member.role] || roleConfig.viewer;
                const RoleIcon = roleCfg.icon;
                return (
                  <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-blue/30 to-brand-purple/30 flex items-center justify-center border border-white/10 text-white font-semibold text-sm">
                          {member.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.full_name}</p>
                          <p className="text-gray-500 text-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={member.role === "owner"}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border ${roleCfg.color} bg-transparent focus:outline-none cursor-pointer disabled:cursor-default`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r} className="bg-gray-900 capitalize">{r.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs hidden md:table-cell">
                      {member.last_login_at
                        ? new Date(member.last_login_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {member.role !== "owner" && (
                        <button
                          onClick={() => handleDeactivate(member.id, member.full_name)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                          title="Deactivate user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
