"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { auditsApi } from "@/lib/api";
import { FileText, Download, Send, Clock, CheckCircle2, AlertCircle, FileCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FilingPortalPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch real audits
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["audits"],
    queryFn: async () => {
      const response = await auditsApi.list();
      return response.data;
    },
  });

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: (id: string) => auditsApi.download(id),
    onSuccess: (response) => {
      window.open(response.data.download_url, "_blank");
      toast.success("Opening PDF report...");
    },
    onError: () => {
      toast.error("Failed to generate download link. Is the report ready?");
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (id: string) => auditsApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
      toast.success("Successfully submitted to NDPC portal!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to submit report");
    },
  });

  const handleDownload = (id: string) => {
    downloadMutation.mutate(id);
  };

  const handleSubmitToNDPC = (id: string, name: string) => {
    if (confirm(`Are you sure you want to officially submit "${name}" to the NDPC portal?`)) {
      submitMutation.mutate(id);
    }
  };

  // Filter items based on logic - using audit status and scope
  const items = audits.map((a: any) => ({
    ...a,
    isSubmitted: a.scope?.submitted_to_ndpc === true,
    displayStatus: a.scope?.submitted_to_ndpc ? "submitted" : (a.status === "completed" ? "ready" : "draft")
  }));

  const filteredItems = items.filter((item: any) => {
    if (activeTab === "all") return item.status === "completed"; // Only show completed ones in filing portal
    if (activeTab === "ready") return item.displayStatus === "ready";
    if (activeTab === "submitted") return item.displayStatus === "submitted";
    return false;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 relative">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-purple/5 rounded-full blur-[120px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2"
      >
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Filing <span className="text-gradient">Portal</span>
          </h1>
          <p className="text-gray-400 mt-2 text-base font-medium max-w-xl leading-relaxed">
            Officially transmit your verified compliance reports to the NDPC regulatory infrastructure via our secure encrypted gateway.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg">
            <div className="h-2 w-2 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest leading-none">Gateway Active</span>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-cyan/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-brand-cyan relative" />
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Decrypting transmission channels...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Status Pipeline / Summary */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-cyan" />
                Transmission Status
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-x-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">Pending Filing</span>
                  </div>
                  <span className="text-lg font-bold text-white pr-2">{items.filter((i: any) => i.displayStatus === 'ready').length}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                  <div className="flex items-center gap-x-3 text-blue-600">
                    <div className="h-8 w-8 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                        <Send className="h-4 w-4 text-brand-blue" />
                    </div>
                    <span className="text-sm font-semibold text-gray-300">Filed Reports</span>
                  </div>
                  <span className="text-lg font-bold text-white pr-2">{items.filter((i: any) => i.displayStatus === 'submitted').length}</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-brand-blue/5 p-6 rounded-3xl border border-brand-blue/20 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-brand-blue/10 rounded-full blur-2xl" />
              <div className="flex gap-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-brand-cyan" />
                <h3 className="font-bold text-brand-cyan text-lg">Requirements</h3>
              </div>
              <ul className="text-sm text-gray-400 space-y-3 font-medium">
                <li className="flex gap-2 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald shrink-0 mt-0.5" />
                    Compliance score &gt; 80%
                </li>
                <li className="flex gap-2 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald shrink-0 mt-0.5" />
                    DPO digital signature
                </li>
                <li className="flex gap-2 leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald shrink-0 mt-0.5" />
                    Verified audit evidence
                </li>
              </ul>
              <div className="mt-6">
                <a href="#" className="inline-flex items-center text-xs font-bold text-brand-cyan uppercase tracking-widest hover:text-white transition-colors group">
                    View Guidelines <ExternalLink className="ml-2 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative"
            >
              {/* Tabs - Refined */}
              <div className="px-8 pt-6 border-b border-white/5 bg-white/[0.01]">
                <nav className="-mb-px flex space-x-10">
                  {['all', 'ready', 'submitted'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`
                        relative py-6 px-1 text-sm font-bold capitalize transition-all overflow-visible
                        ${activeTab === tab
                          ? 'text-brand-cyan'
                          : 'text-gray-500 hover:text-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {tab}
                        <span className={`
                          py-0.5 px-2.5 rounded-full text-[10px] font-bold border
                          ${activeTab === tab 
                            ? 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan' 
                            : 'bg-white/5 border-white/10 text-gray-500'}
                        `}>
                          {tab === 'all' ? items.filter((i: any) => i.status === 'completed').length : items.filter((i: any) => i.displayStatus === tab).length}
                        </span>
                      </div>
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="tabUnderline" 
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-blue to-brand-cyan rounded-t-full shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* List */}
              <div className="flex-1 divide-y divide-white/5">
                {filteredItems.map((item: any) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="p-8 hover:bg-white/[0.03] transition-all group relative overflow-hidden"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      
                      {/* Info section enhanced */}
                      <div className="flex gap-6 items-center">
                        <div className={`p-4 rounded-2xl flex items-center justify-center h-16 w-16 shrink-0 shadow-lg transition-transform group-hover:scale-110 ${
                          item.displayStatus === 'ready' 
                            ? 'bg-amber-500/10 border border-amber-500/20' 
                            : 'bg-brand-blue/10 border border-brand-blue/20'
                        }`}>
                          <FileCheck className={`h-8 w-8 ${
                            item.displayStatus === 'ready' ? 'text-amber-500' : 'text-brand-blue'
                          }`} />
                        </div>
                        
                        <div>
                          <h4 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm font-medium text-gray-500">
                            <span className="flex items-center gap-1.5 border-r border-white/10 pr-6">
                                <Clock className="h-3.5 w-3.5" />
                                Completed {new Date(item.completed_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5 border-r border-white/10 pr-6">
                                <Shield className="h-3.5 w-3.5" />
                                Compliance Score <span className={`ml-1 font-bold text-lg ${item.compliance_score >= 80 ? 'text-brand-emerald' : 'text-status-error'}`}>{item.compliance_score}%</span>
                            </span>
                            {item.isSubmitted && (
                                <span className="bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full text-xs font-bold border border-brand-blue/20 flex items-center gap-1.5">
                                    <div className="h-1 w-1 rounded-full bg-brand-blue animate-pulse" />
                                    Filed {new Date(item.scope.submitted_at).toLocaleDateString()}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions with better styling */}
                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          onClick={() => handleDownload(item.id)}
                          disabled={downloadMutation.isPending}
                          className="flex items-center gap-2 px-5 py-3 border border-white/10 rounded-2xl text-sm font-bold text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-lg group/btn"
                        >
                          {downloadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />}
                          Preview CAR
                        </button>
                        
                        {item.displayStatus === 'ready' && (
                          <button 
                            onClick={() => handleSubmitToNDPC(item.id, item.name)}
                            disabled={submitMutation.isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-blue to-brand-cyan text-white rounded-2xl text-sm font-bold hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all disabled:opacity-50 active:scale-95 shadow-xl group/submit"
                          >
                            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-submit:translate-x-0.5 group-submit:-translate-y-0.5 transition-transform" />}
                            Transmit to NDPC
                          </button>
                        )}
                        
                        {item.displayStatus === 'submitted' && (
                          <div className="flex flex-col items-end">
                            <span className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                TRANSMITTING
                            </span>
                            <span className="text-[10px] font-medium text-gray-600 uppercase tracking-widest mt-1">Pending Approval</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {filteredItems.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-24 text-center"
                  >
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                        <FileText className="w-20 h-20 mx-auto text-gray-700 relative" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Archive records empty</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Perform a compliance audit to generate reports for official filing.</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

