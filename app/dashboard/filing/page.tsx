"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Filing Portal</h1>
        <p className="text-gray-500 mt-1">
          Review, download, and submit official Compliance Audit Reports (CAR) to the regulator.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Status Pipeline / Summary */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Submission Pipeline</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">Ready to Submit</span>
                  </div>
                  <span className="font-semibold text-gray-900">{items.filter((i: any) => i.displayStatus === 'ready').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2 text-blue-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Submitted</span>
                  </div>
                  <span className="font-semibold text-gray-900">{items.filter((i: any) => i.displayStatus === 'submitted').length}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 shadow-sm">
              <div className="flex gap-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">NDPC Requirements</h3>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                Ensure your compliance score is above 80% before submitting. Reports must be digitally signed by your designated Data Protection Officer (DPO).
              </p>
              <a href="#" className="mt-3 inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800">
                Read submission guidelines <ExternalLink className="ml-1 w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 px-4">
                <nav className="-mb-px flex space-x-8">
                  {['all', 'ready', 'submitted'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium capitalize flex  items-center`}
                    >
                      {tab}
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {tab === 'all' ? items.filter((i: any) => i.status === 'completed').length : items.filter((i: any) => i.displayStatus === tab).length}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* List */}
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item: any) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      
                      {/* Info */}
                      <div className="flex gap-4">
                        <div className={`p-3 rounded-lg flex items-center justify-center h-12 w-12 shrink-0 ${
                          item.displayStatus === 'ready' ? 'bg-amber-100' : 'bg-blue-100'
                        }`}>
                          <FileCheck className={`h-6 w-6 ${
                            item.displayStatus === 'ready' ? 'text-amber-600' : 'text-blue-600'
                          }`} />
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-gray-500">
                            <span>Completed: {new Date(item.completed_at).toLocaleDateString()}</span>
                            <span className="flex items-center">
                              Score: <span className={`ml-1 font-semibold ${item.compliance_score >= 80 ? 'text-green-600' : 'text-red-500'}`}>{item.compliance_score}%</span>
                            </span>
                            {item.isSubmitted && (
                                <span className="bg-gray-100 text-gray-700 px-2 rounded text-xs border border-gray-200">
                                    Submitted: {new Date(item.scope.submitted_at).toLocaleDateString()}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 md:self-center shrink-0">
                        <button 
                          onClick={() => handleDownload(item.id)}
                          disabled={downloadMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {downloadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Preview PDF
                        </button>
                        
                        {item.displayStatus === 'ready' && (
                          <button 
                            onClick={() => handleSubmitToNDPC(item.id, item.name)}
                            disabled={submitMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-500 shadow-sm disabled:opacity-50"
                          >
                            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit to NDPC
                          </button>
                        )}
                        
                        {item.displayStatus === 'submitted' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Under Review
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredItems.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>No reports found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

