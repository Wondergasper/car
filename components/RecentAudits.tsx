"use client";

import { FileText, Download } from "lucide-react";

const audits = [
  { id: 1, name: "Q1 2026 CAR Report", date: "Apr 10, 2026", status: "Ready", findings: 12 },
  { id: 2, name: "Data Privacy Audit", date: "Apr 8, 2026", status: "In Progress", findings: 8 },
  { id: 3, name: "Customer Data Review", date: "Apr 5, 2026", status: "Completed", findings: 23 },
  { id: 4, name: "Access Control Audit", date: "Apr 1, 2026", status: "Completed", findings: 5 },
];

const statusColors: Record<string, string> = {
  Ready: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Completed: "bg-blue-100 text-blue-800",
};

export default function RecentAudits() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Recent Audits</h3>
      <p className="text-sm text-gray-500 mt-1">Latest compliance reports</p>

      <div className="mt-4 space-y-4">
        {audits.map((audit) => (
          <div
            key={audit.id}
            className="flex items-start justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200"
          >
            <div className="flex items-start gap-x-3">
              <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{audit.name}</p>
                <p className="text-xs text-gray-500">{audit.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[audit.status]}`}
              >
                {audit.status}
              </span>
              {audit.status === "Ready" && (
                <button className="p-1 text-gray-400 hover:text-primary-600">
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
