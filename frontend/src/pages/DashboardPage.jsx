import React from "react";
import { StatCard, PatentList } from "../components/PatentComponents";

export default function DashboardPage({ patents }) {
  const total = patents.length;
  const analyzed = total; // all uploaded patents are marked analyzed in this demo
  const pending = 0;
  const highRisk = patents.filter((p) => p.risk === "Medium risk" || p.risk === "High risk").length;
  const percent = total === 0 ? "0% complete" : "100% complete";

  return (
    <div className="p-4 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Patents" value={total} sub="Uploaded in database" dotColor="bg-status-blue" />
        <StatCard label="Analyzed" value={analyzed} sub={percent} dotColor="bg-status-green" />
        <StatCard label="Pending review" value={pending} sub="Action needed" dotColor="bg-status-amber" />
        <StatCard label="High risk" value={highRisk} sub="Conflict found" dotColor="bg-status-red" />
      </div>

      <div className="text-base font-semibold text-text-primary mb-4">Recent Uploads</div>
      <PatentList patents={patents.slice(0, 5)} />
    </div>
  );
}
