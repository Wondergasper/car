"use client";

import { FileText, Download, Clock, CheckCircle } from "lucide-react";

const audits = [
  { id: 1, name: "Q1 2026 CAR Report", date: "Apr 10, 2026", status: "Ready", type: "Quarterly" },
  { id: 2, name: "Data Privacy Audit", date: "Apr 8, 2026", status: "In Progress", type: "Security" },
  { id: 3, name: "Customer Data Review", date: "Apr 5, 2026", status: "Completed", type: "Compliance" },
];

const statusColors: Record<string, string> = {
  Ready: "bg-green-500/10 text-green-400 border border-green-500/20",
  "In Progress": "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  Completed: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export default function RecentAudits() {
  return (
    <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Recent Audits</h3>
          <p className="text-sm text-gray-400 mt-1">Latest compliance reports</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {audits.map((audit) => (
          <div
            key={audit.id}
            className="flex flex-col gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-brand-purple/10 flex items-center justify-center border border-brand-purple/20">
                    <FileText className="h-5 w-5 text-brand-purple" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-brand-purple transition-colors">{audit.name}</p>
                  <p className="text-xs text-gray-500">{audit.type} • {audit.date}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[audit.status]}`}
              >
                {audit.status}
              </span>
            </div>
            
            {audit.status === "Ready" && (
              <button className="flex items-center w-full justify-center gap-2 mt-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors border border-white/10">
                <Download className="h-4 w-4" /> Download Report
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
