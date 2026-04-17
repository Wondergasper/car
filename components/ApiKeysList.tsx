"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "@/lib/api";
import { Key, Plus, Trash2, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ApiKeysList() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Fetch real keys
  const { data: keys = [], isLoading } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: async () => {
      const response = await apiKeysApi.list();
      return response.data;
    },
  });

  // Create key mutation
  const createMutation = useMutation({
    mutationFn: (name: string) => apiKeysApi.create({ name }),
    onSuccess: (response) => {
      setGeneratedKey(response.data.full_key);
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast.success("API Key generated");
    },
    onError: () => {
      toast.error("Failed to generate API Key");
    },
  });

  // Revoke key mutation
  const revokeMutation = useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
      toast.success("API Key revoked");
    },
    onError: () => {
      toast.error("Failed to revoke API Key");
    },
  });

  const handleGenerate = () => {
    if (!newKeyName || createMutation.isPending) return;
    createMutation.mutate(newKeyName);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard");
  };

  const handleRevoke = (id: string, name: string) => {
    if(confirm(`Are you sure you want to revoke API Key: ${name}? This action cannot be undone.`)) {
      revokeMutation.mutate(id);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage API keys for programmatic access and connector integrations.
          </p>
        </div>
        <button 
          onClick={() => { setShowDialog(true); setGeneratedKey(null); setNewKeyName(""); }}
          className="flex items-center gap-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          Generate New Key
        </button>
      </div>

      {showDialog && (
        <div className="mt-4 p-4 border border-primary-200 bg-primary-50 rounded-lg">
          {!generatedKey ? (
            <div className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Integration"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerate}
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Generate
                </button>
                <button 
                  onClick={() => setShowDialog(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2 text-green-700 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                <span>API Key Generated Successfully</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please copy this key immediately. For security reasons, it will never be shown again.
              </p>
              <div className="flex items-center gap-2 bg-white border border-gray-300 p-2 rounded-md font-mono text-sm">
                <p className="flex-1 truncate select-all">{generatedKey}</p>
                <button 
                  onClick={() => handleCopy(generatedKey)}
                  className="p-1 text-gray-500 hover:text-primary-600 rounded bg-gray-100 hover:bg-primary-50"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <button 
                onClick={() => setShowDialog(false)}
                className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : keys.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Prefix</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keys.map((k: any) => (
                  <tr key={k.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-x-3">
                        <div className="p-2 bg-gray-100 rounded-md">
                          <Key className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{k.name}</p>
                          <p className="text-xs font-mono text-gray-500 mt-0.5">{k.key_prefix}•••</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(k.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {k.last_used_at ? formatTime(k.last_used_at) : "Never"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <button 
                        onClick={() => handleRevoke(k.id, k.name)}
                        disabled={revokeMutation.isPending}
                        className="text-red-600 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                        title="Revoke Key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <Key className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No API Keys</h3>
            <p className="mt-1 text-sm text-gray-500 text-center max-w-md mx-auto">
              You haven&apos;t generated any API keys yet. Create one to authenticate external SDKs or connectors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

