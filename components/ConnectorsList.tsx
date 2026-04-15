"use client";

import { useState } from "react";
import { Plus, Database, CheckCircle, AlertCircle, XCircle } from "lucide-react";

const connectors = [
  { id: 1, name: "Customer DB", type: "PostgreSQL", status: "active", lastSync: "2 min ago" },
  { id: 2, name: "HR System", type: "REST API", status: "active", lastSync: "5 min ago" },
  { id: 3, name: "Transaction Log", type: "MongoDB", status: "error", lastSync: "1 hour ago" },
  { id: 4, name: "Email Server", type: "SMTP", status: "inactive", lastSync: "Never" },
];

const statusIcons: Record<string, any> = {
  active: CheckCircle,
  error: AlertCircle,
  inactive: XCircle,
};

const statusColors: Record<string, string> = {
  active: "text-green-600",
  error: "text-red-600",
  inactive: "text-gray-400",
};

export default function ConnectorsList() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Data Connectors</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your data source connections
          </p>
        </div>
        <button className="flex items-center gap-x-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-500">
          <Plus className="h-4 w-4" />
          Add Connector
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Sync
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {connectors.map((connector) => {
              const Icon = statusIcons[connector.status];
              return (
                <tr key={connector.id}>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-x-3">
                      <Database className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {connector.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {connector.type}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-x-2">
                      <Icon className={`h-4 w-4 ${statusColors[connector.status]}`} />
                      <span className="text-sm capitalize text-gray-700">
                        {connector.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {connector.lastSync}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-right text-sm">
                    <button className="text-primary-600 hover:text-primary-500 font-medium">
                      Configure
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
