"use client";

import ComplianceOverview from "@/components/ComplianceOverview";
import ConnectorsList from "@/components/ConnectorsList";
import RecentAudits from "@/components/RecentAudits";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Compliance Score" value="87%" trend="+5%" positive />
        <StatCard title="Active Connectors" value="12" trend="+2" positive />
        <StatCard title="Open Findings" value="23" trend="-8" positive />
        <StatCard title="Pending Reports" value="3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ComplianceOverview />
        </div>
        <div>
          <RecentAudits />
        </div>
      </div>

      <ConnectorsList />
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  positive,
}: {
  title: string;
  value: string;
  trend?: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      {trend && (
        <p
          className={`mt-1 text-sm ${positive ? "text-green-600" : "text-red-600"}`}
        >
          {positive ? "↑" : "↓"} {trend} from last month
        </p>
      )}
    </div>
  );
}
