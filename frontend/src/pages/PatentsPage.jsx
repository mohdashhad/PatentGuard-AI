import React from "react";
import { PatentList } from "../components/PatentComponents";

export default function PatentsPage({ patents, onClearDatabase }) {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="text-base font-semibold text-text-primary">Database Records</div>
        <button
          type="button"
          onClick={onClearDatabase}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md2 text-sm font-semibold bg-danger-bg text-danger-fg border border-danger-bg hover:opacity-90 transition-opacity w-full sm:w-auto"
        >
          <i className="ti ti-trash text-base" aria-hidden="true"></i>
          Clear Entire Database
        </button>
      </div>
      <PatentList patents={patents} />
    </div>
  );
}
