import React from "react";

const TITLES = {
  dashboard: { title: "Dashboard", sub: "System status and overview" },
  patents: { title: "My Patents", sub: "All uploaded documents" },
  upload: { title: "Upload", sub: "Add a new patent document" },
  rag: { title: "RAG Search", sub: "Ask questions about your patents" },
  claim: { title: "Claim Review", sub: "AI legal analysis of your claims" },
  evidence: { title: "Evidence Check", sub: "Live internet prior-art search" },
};

export default function Topbar({ activeTab, onNewUpload, onOpenMobileMenu }) {
  const meta = TITLES[activeTab] || TITLES.dashboard;

  return (
    <header className="h-16 md:h-[73px] px-4 md:px-6 border-b border-border-tertiary bg-bg-primary flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden text-text-secondary hover:text-text-primary"
          aria-label="Open menu"
        >
          <i className="ti ti-menu-2 text-2xl" aria-hidden="true"></i>
        </button>
        <div className="min-w-0">
          <div className="text-base md:text-lg font-semibold text-text-primary truncate capitalize">
            {meta.title}
          </div>
          <div className="text-xs md:text-sm text-text-tertiary truncate hidden sm:block">
            {meta.sub}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewUpload}
        className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-md2 text-xs md:text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors flex-shrink-0"
      >
        <i className="ti ti-plus text-base" aria-hidden="true"></i>
        <span className="hidden sm:inline">New Upload</span>
      </button>
    </header>
  );
}
