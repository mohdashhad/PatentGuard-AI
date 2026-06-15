import React from "react";

export function StatCard({ label, value, sub, dotColor }) {
  return (
    <div className="bg-bg-primary border border-border-tertiary rounded-lg2 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-text-tertiary font-medium mb-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
        {label}
      </div>
      <div className="text-2xl md:text-[28px] font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-secondary mt-1">{sub}</div>
    </div>
  );
}

export function PatentList({ patents }) {
  if (!patents || patents.length === 0) {
    return (
      <div className="bg-bg-primary border border-border-tertiary rounded-lg2 overflow-hidden">
        <div className="text-center py-10 px-5 text-text-tertiary">
          <i className="ti ti-file-x text-5xl text-slate-300" aria-hidden="true"></i>
          <h3 className="text-base font-semibold mt-3 text-text-primary">No patents found</h3>
          <p className="text-sm mt-1">Upload a document to start.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary border border-border-tertiary rounded-lg2 overflow-hidden">
      {patents.map((p, idx) => (
        <div
          key={p.id}
          className={`flex items-center gap-4 p-4 ${
            idx !== patents.length - 1 ? "border-b border-border-tertiary" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-md2 bg-patentIcon-bg flex items-center justify-center flex-shrink-0">
            <i className="ti ti-file-text text-xl text-patentIcon-fg" aria-hidden="true"></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text-primary truncate">{p.name}</div>
            <div className="text-xs text-text-tertiary mt-1">
              Uploaded {p.date} · {p.claims} claims
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-badge-analyzedBg text-badge-analyzedFg whitespace-nowrap">
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}
