"use client";

import { useState } from "react";
import { FileText, Download, Eye, Calendar, Filter } from "lucide-react";

const reports = [
  {
    id: 1,
    name: "Q1 2026 CAR Report",
    date: "Apr 10, 2026",
    status: "Ready",
    score: 87,
    findings: 12,
    critical: 1,
    high: 3,
    medium: 5,
    low: 3,
  },
  {
    id: 2,
    name: "Data Privacy Audit",
    date: "Apr 8, 2026",
    status: "In Progress",
    score: null,
    findings: 8,
    critical: 0,
    high: 2,
    medium: 4,
    low: 2,
  },
  {
    id: 3,
    name: "Customer Data Review",
    date: "Apr 5, 2026",
    status: "Completed",
    score: 82,
    findings: 23,
    critical: 2,
    high: 5,
    medium: 10,
    low: 6,
  },
  {
    id: 4,
    name: "Access Control Audit",
    date: "Apr 1, 2026",
    status: "Completed",
    score: 95,
    findings: 5,
    critical: 0,
    high: 0,
    medium: 2,
    low: 3,
  },
];

const statusColors: Record<string, string> = {
  Ready: "bg-green-100 text-green-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  Completed: "bg-blue-100 text-blue-800",
};

export default function ReportsPage() {
  const [filter, setFilter] = useState<string>("all");

  const filteredReports = filter === "all" ? reports : reports.filter((r) => r.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Reports</h1>
          <p className="text-gray-500 mt-1">
            View and download compliance audit reports
          </p>
        </div>
        <button className="flex items-center gap-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500">
          <FileText className="h-4 w-4" />
          Generate New Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-x-3">
        <Filter className="h-4 w-4 text-gray-400" />
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${filter === "all" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("ready")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${filter === "ready" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Ready
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`rounded-md px-3 py-1 text-sm font-medium ${filter === "completed" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Completed
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-x-4">
                <div className="rounded-lg bg-primary-50 p-3">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                  <div className="flex items-center gap-x-3 mt-1">
                    <span className="flex items-center gap-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {report.date}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-x-3">
                {report.score !== null && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Score</p>
                    <p className={`text-2xl font-bold ${report.score >= 80 ? "text-green-600" : report.score >= 60 ? "text-yellow-600" : "text-red-600"}`}>
                      {report.score}%
                    </p>
                  </div>
                )}
                {report.status === "Ready" && (
                  <button className="flex items-center gap-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500">
                    <Download className="h-4 w-4" />
                    Download CAR
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-primary-600">
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Findings Breakdown */}
            <div className="mt-4 flex items-center gap-x-6 border-t border-gray-100 pt-4">
              <span className="text-sm text-gray-500">Findings: {report.findings} total</span>
              <span className="text-sm text-red-600">{report.critical} Critical</span>
              <span className="text-sm text-orange-600">{report.high} High</span>
              <span className="text-sm text-yellow-600">{report.medium} Medium</span>
              <span className="text-sm text-blue-600">{report.low} Low</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
