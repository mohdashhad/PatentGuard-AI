import React from "react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "ti-layout-dashboard", section: "main" },
  { id: "patents", label: "My patents", icon: "ti-file-text", section: "main", badge: true },
  { id: "upload", label: "Upload", icon: "ti-upload", section: "main" },
  { id: "rag", label: "RAG search", icon: "ti-brain", section: "analysis" },
  { id: "claim", label: "Claim review", icon: "ti-list-check", section: "analysis" },
  { id: "evidence", label: "Evidence check", icon: "ti-certificate", section: "analysis" },
];

export default function Sidebar({ activeTab, onTabChange, patentCount, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.username || user?.email || "User";
  const initials = displayName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

  const handleNavClick = (id) => {
    onTabChange(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const renderNavItem = (item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavClick(item.id)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md2 text-sm mb-1 transition-colors text-left
          ${
            isActive
              ? "bg-bg-primary text-brand font-semibold shadow-sm"
              : "text-text-secondary hover:bg-border-tertiary"
          }`}
      >
        <i className={`ti ${item.icon} text-lg`} aria-hidden="true"></i>
        <span className="whitespace-nowrap">{item.label}</span>
        {item.badge && (
          <span className="ml-auto text-[11px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            {patentCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          bg-bg-secondary border-r border-border-tertiary flex flex-col
          md:w-60 md:min-w-60 md:static md:translate-x-0 md:h-screen
          fixed top-0 left-0 h-screen w-64 z-40 transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-border-tertiary flex items-center gap-3">
          <div className="w-9 h-9 rounded-md2 bg-brand-logoIconBg flex items-center justify-center flex-shrink-0">
            <i className="ti ti-shield-check text-xl text-brand-logoIconFg" aria-hidden="true"></i>
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-text-primary truncate">PatentGuard</div>
            <div className="text-xs text-text-tertiary truncate">React Dashboard</div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto md:hidden text-text-tertiary hover:text-text-primary"
            aria-label="Close menu"
          >
            <i className="ti ti-x text-xl" aria-hidden="true"></i>
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 flex-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-2.5 pt-3 pb-1">
            Main menu
          </div>
          {NAV_ITEMS.filter((i) => i.section === "main").map(renderNavItem)}

          <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-2.5 pt-4 pb-1">
            Analysis
          </div>
          {NAV_ITEMS.filter((i) => i.section === "analysis").map(renderNavItem)}
        </nav>

        {/* User / logout */}
        <div className="p-4 border-t border-border-tertiary">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-2.5 rounded-md2 bg-bg-primary border border-border-tertiary hover:bg-bg-secondary transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-avatar-bg text-avatar-fg flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-text-primary capitalize truncate">
                {displayName}
              </div>
              <div className="text-xs text-status-green font-medium flex items-center gap-1">
                <span>●</span> Online
              </div>
            </div>
            <i className="ti ti-logout text-text-tertiary text-lg" aria-hidden="true"></i>
          </button>
        </div>
      </aside>
    </>
  );
}
