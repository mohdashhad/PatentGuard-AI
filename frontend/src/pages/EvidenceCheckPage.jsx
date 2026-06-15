import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { sanitizeInput } from "../utils/validation";

const MAX_QUERY_LENGTH = 300;

function buildSafeUrl(rawUrl) {
  if (!rawUrl) return null;
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

export default function EvidenceCheckPage() {
  const { API_BASE_URL, token } = useAuth();
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [results, setResults] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_QUERY_LENGTH) {
      setQuery(value);
      if (error) setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const cleanQuery = sanitizeInput(query);

    if (!cleanQuery) {
      setError("Please enter your invention idea.");
      return;
    }
    if (cleanQuery.length < 3) {
      setError("Please provide more detail (at least 3 characters).");
      return;
    }

    setError(null);
    setApiError(null);
    setSummary(null);
    setResults(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/live-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query: cleanQuery }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSummary(data.ai_summary || "");
        setResults(Array.isArray(data.raw_results) ? data.raw_results : []);
      } else {
        setApiError("Error processing search.");
      }
    } catch {
      setApiError("API connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-bg-primary border border-border-tertiary rounded-lg2 p-4 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <i className="ti ti-certificate text-3xl sm:text-4xl text-brand" aria-hidden="true"></i>
          <h2 className="text-xl sm:text-2xl md:text-[28px] font-bold text-text-primary">
            Live Evidence Check
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 mb-6">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Enter your invention idea..."
              aria-invalid={Boolean(error)}
              className={`w-full px-4 py-3 rounded-md2 border outline-none text-sm bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:ring-2 transition-colors
                ${error ? "border-status-red focus:ring-status-red/30" : "border-slate-300 focus:ring-login-accent/30 focus:border-login-accent"}`}
            />
            {error && <p className="mt-1.5 text-xs text-status-red font-medium">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md2 text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-60 transition-colors flex-shrink-0"
          >
            <i className={`ti ${loading ? "ti-loader ti-spin" : "ti-world"} text-base`} aria-hidden="true"></i>
            {loading ? "Searching..." : "Search Live Internet"}
          </button>
        </form>

        <div className="text-left bg-bg-secondary rounded-md2 border border-border-tertiary min-h-[150px] p-4 sm:p-6">
          {loading && (
            <div className="text-center py-5">
              <i className="ti ti-loader ti-spin text-3xl text-brand" aria-hidden="true"></i>
            </div>
          )}

          {apiError && <p className="text-status-red text-sm">{apiError}</p>}

          {!loading && !apiError && summary === null && (
            <div className="text-center text-slate-400 mt-5">
              <i className="ti ti-file-search text-4xl mb-2.5 inline-block" aria-hidden="true"></i>
              <p className="text-sm">Live internet search results will appear here.</p>
            </div>
          )}

          {!loading && summary !== null && (
            <>
              <div className="p-4 rounded-md2 mb-5 bg-info-blueBg text-info-blueFg text-sm whitespace-pre-line">
                <strong>AI Summary:</strong>
                <br />
                {summary}
              </div>

              {results && results.length > 0 && (
                <div>
                  <strong className="text-sm text-text-primary">Top Matches:</strong>
                  <div className="mt-2.5 space-y-3">
                    {results.map((match, idx) => {
                      const safeUrl = buildSafeUrl(match.link);
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-bg-primary border border-border-tertiary rounded-md2"
                        >
                          <div className="font-semibold text-sm text-text-primary mb-1.5">
                            {idx + 1}. {match.title}
                          </div>
                          {safeUrl ? (
                            <a
                              href={safeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand font-medium text-sm inline-flex items-center gap-1 hover:underline"
                            >
                              <i className="ti ti-external-link text-base" aria-hidden="true"></i>
                              Click Here to Open Link
                            </a>
                          ) : (
                            <span className="text-text-tertiary text-sm">No link available</span>
                          )}
                          {safeUrl && (
                            <div className="text-[11px] text-text-tertiary mt-1.5 break-all">
                              <strong>Direct URL:</strong> {safeUrl}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
