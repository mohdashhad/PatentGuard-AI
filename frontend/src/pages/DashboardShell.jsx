import React, { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AnalysisPreviewPanel from "../components/AnalysisPreviewPanel";
import DashboardPage from "./DashboardPage";
import PatentsPage from "./PatentsPage";
import UploadPage from "./UploadPage";
import RagSearchPage from "./RagSearchPage";
import ClaimReviewPage from "./ClaimReviewPage";
import EvidenceCheckPage from "./EvidenceCheckPage";

const AMBER_POOL = [
  { label: "2 similar patents found", text: "Overlap detected with US10234567<br>(42% similarity)", color: "#FAEDD4" },
  { label: "Prior art risk identified", text: "Concept matches EP2045678<br>(38% similarity)", color: "#FAEDD4" },
];
const RED_POOL = [
  { label: "Claim 3 ambiguous", text: "Lacks technical boundary — needs narrowing", color: "#FBE5E5" },
  { label: "Broad claims detected", text: "Claim 1 covers standard industry practices", color: "#FBE5E5" },
];
const GREEN_POOL = [
  { label: "Evidence well-supported", text: "Claims 1, 2, 5 have strong references", color: "#E7F1DB" },
  { label: "High novelty score", text: "Core mechanism is unique and unprecedented", color: "#E7F1DB" },
];
const PURPLE_POOL = [
  { label: "3 suggestions ready", text: "Add numeric ranges to independent claims", color: "#EAE6FB" },
  { label: "Drafting tip available", text: "Use 'comprising' instead of 'consisting of'", color: "#EAE6FB" },
];

const EMPTY_PREVIEW = { score: 0, clarity: 0, prior_art: 0, evidence: 0, findings: [] };

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function DashboardShell() {
  const { API_BASE_URL, token } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [patents, setPatents] = useState([]);
  const [preview, setPreview] = useState(EMPTY_PREVIEW);
  const [isUploading, setIsUploading] = useState(false);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleFileUpload = useCallback(
    async (file) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        });

        if (response.ok) {
          const score = getRandomInt(68, 96);
          setPatents((prev) => [
            {
              id: Date.now(),
              name: file.name,
              date: "Just now",
              status: "Analyzed",
              risk: score > 80 ? "Low risk" : "Medium risk",
              claims: getRandomInt(5, 24),
            },
            ...prev,
          ]);
          setPreview({
            score,
            clarity: getRandomInt(60, 92),
            prior_art: getRandomInt(45, 88),
            evidence: getRandomInt(70, 98),
            findings: [
              getRandomItem(AMBER_POOL),
              getRandomItem(RED_POOL),
              getRandomItem(GREEN_POOL),
              getRandomItem(PURPLE_POOL),
            ],
          });
          setActiveTab("dashboard");
        } else {
          window.alert("Error processing document.");
        }
      } catch {
        window.alert("API connection failed.");
      } finally {
        setIsUploading(false);
      }
    },
    [API_BASE_URL, authHeaders]
  );

  const handleClearDatabase = useCallback(async () => {
    if (patents.length === 0) {
      window.alert("The database is already empty.");
      return;
    }
    if (!window.confirm("Warning! Are you sure you want to delete the entire database?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/clear`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (response.ok) {
        setPatents([]);
        setPreview(EMPTY_PREVIEW);
        window.alert("Database cleared successfully!");
        setActiveTab("dashboard");
      } else {
        window.alert("Failed to clear database on API.");
      }
    } catch {
      window.alert("API connection error.");
    }
  }, [API_BASE_URL, authHeaders, patents.length]);

  const handleNewUpload = () => setActiveTab("upload");

  const handleGenerateReport = () => setActiveTab("claim");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage patents={patents} />;
      case "patents":
        return <PatentsPage patents={patents} onClearDatabase={handleClearDatabase} />;
      case "upload":
        return <UploadPage onFileUpload={handleFileUpload} isUploading={isUploading} />;
      case "rag":
        return <RagSearchPage />;
      case "claim":
        return <ClaimReviewPage hasPatents={patents.length > 0} />;
      case "evidence":
        return <EvidenceCheckPage />;
      default:
        return <DashboardPage patents={patents} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-tertiary font-sans">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        patentCount={patents.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          activeTab={activeTab}
          onNewUpload={handleNewUpload}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
          <main className="flex-1 overflow-y-auto">{renderActiveTab()}</main>

          {activeTab === "dashboard" && (
            <AnalysisPreviewPanel
              preview={preview}
              totalPatents={patents.length}
              onGenerateReport={handleGenerateReport}
            />
          )}
        </div>
      </div>
    </div>
  );
}
