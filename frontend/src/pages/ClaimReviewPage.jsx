import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ClaimReviewPage({ hasPatents }) {
  const { API_BASE_URL, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  const runAnalysis = async () => {
    if (!hasPatents) {
      setError("Please upload a patent first from the Upload tab!");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auto-analyze`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setResults({
          claimAnalysis: data.claim_analysis || "",
          legalReview: data.legal_review || "",
          suggestions: data.suggestions || "",
        });
      } else {
        setError("Analysis failed.");
      }
    } catch {
      setError("API connection failed.");
    } finally {
      setLoading(false);
      setHasRun(true);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-bg-primary border border-border-tertiary rounded-lg2 p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <i className="ti ti-clipboard-list text-3xl sm:text-4xl text-text-tertiary" aria-hidden="true"></i>
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-text-primary">
            AI Claim Review & Legal Analysis
          </h2>
        </div>

        {!loading && (
          <button
            type="button"
            onClick={runAnalysis}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md2 text-white font-semibold text-sm mb-6 transition-colors bg-danger-solid hover:opacity-90"
          >
            <i className={`ti ${hasRun ? "ti-reload" : "ti-settings"} text-base`} aria-hidden="true"></i>
            {hasRun ? "Run Analysis Again" : "Generate Full Legal Report"}
          </button>
        )}

        {error && (
          <div className="px-4 py-3 rounded-md2 bg-danger-bg text-danger-fg text-sm font-medium mb-6 flex items-start gap-2">
            <i className="ti ti-alert-circle text-base mt-0.5" aria-hidden="true"></i>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="py-10 text-center text-danger-solid">
            <i className="ti ti-loader ti-spin text-5xl" aria-hidden="true"></i>
            <p className="mt-4 font-medium text-base">AI is analyzing claims via Hugging Face...</p>
          </div>
        )}

        {results && !loading && (
          <div>
            <div className="px-4 sm:px-5 py-3 rounded-md2 mb-6 font-medium text-sm bg-info-greenBg text-info-greenFg">
              Analysis Complete!
            </div>
            <div className="p-4 sm:p-6 rounded-md2 mb-6 leading-relaxed text-sm bg-info-blueBg text-info-blueFg whitespace-pre-line">
              <strong className="block mb-2">Claim Analysis:</strong>
              {results.claimAnalysis}
            </div>
            <div className="p-4 sm:p-6 rounded-md2 mb-6 leading-relaxed text-sm bg-info-yellowBg text-info-yellowFg whitespace-pre-line">
              <strong className="block mb-2">Legal Review:</strong>
              {results.legalReview}
            </div>
            <div className="p-4 sm:p-6 rounded-md2 leading-relaxed text-sm bg-findings-green text-green-800 whitespace-pre-line">
              <strong className="block mb-2">Suggestions:</strong>
              {results.suggestions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
