import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { sanitizeInput } from "../utils/validation";

const MAX_QUERY_LENGTH = 500;

export default function RagSearchPage() {
  const { API_BASE_URL, token } = useAuth();
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
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
      setError("Please enter a question.");
      return;
    }
    if (cleanQuery.length < 3) {
      setError("Your question is too short.");
      return;
    }

    setError(null);
    setApiError(null);
    setLoading(true);
    setAnswer(null);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ question: cleanQuery }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setAnswer(data.ai_answer || "No answer returned.");
      } else {
        setApiError(data?.detail || "API request failed.");
      }
    } catch {
      setApiError("API connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="bg-bg-primary border border-border-tertiary rounded-lg2 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">AI Patent Engine (RAG)</h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Ask a question about your patents..."
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
            <i className={`ti ${loading ? "ti-loader ti-spin" : "ti-search"} text-base`} aria-hidden="true"></i>
            {loading ? "Searching..." : "Search AI"}
          </button>
        </form>

        <div className="mt-6 p-4 sm:p-6 text-left bg-bg-secondary rounded-md2 border border-border-tertiary min-h-[150px] overflow-y-auto">
          {apiError ? (
            <p className="text-status-red text-sm">{apiError}</p>
          ) : answer ? (
            <div className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
              <strong className="flex items-center gap-2 mb-3">
                <i className="ti ti-robot text-lg" aria-hidden="true"></i> AI Answer:
              </strong>
              {answer}
            </div>
          ) : (
            <div className="text-center text-slate-400 mt-5">
              <i className="ti ti-robot text-4xl mb-2.5 inline-block" aria-hidden="true"></i>
              <p className="text-sm">AI response will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
