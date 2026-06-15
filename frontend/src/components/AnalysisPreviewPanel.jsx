import React from "react";
import theme from "../config/theme";

function ProgressBar({ label, value, color }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5 text-text-primary">
        <span>{label}</span>
        <span className="font-normal">{value}%</span>
      </div>
      <div className="h-[5px] bg-border-tertiary rounded-md overflow-hidden">
        <div
          className="h-full rounded-md transition-[width] duration-500 ease-in-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        ></div>
      </div>
    </div>
  );
}

export default function AnalysisPreviewPanel({ preview, totalPatents, onGenerateReport }) {
  const hasData = totalPatents > 0;

  return (
    <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border-tertiary bg-bg-primary p-6 overflow-y-auto flex-shrink-0">
      <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-6">
        Analysis Preview
      </div>

      <div
        className="w-[100px] h-[100px] rounded-full flex flex-col items-center justify-center mx-auto border-[6px]"
        style={{ borderColor: theme.colors.ring.border, backgroundColor: theme.colors.ring.bg }}
      >
        <div className="text-3xl font-normal leading-none mb-0.5" style={{ color: theme.colors.ring.value }}>
          {preview.score}
        </div>
        <div className="text-[11px]" style={{ color: theme.colors.ring.label }}>
          / 100
        </div>
      </div>
      <div className="text-center text-sm text-text-primary mt-4 mb-7 font-normal">
        Overall patent strength
      </div>

      <ProgressBar label="Claim clarity" value={preview.clarity} color={theme.colors.progress.clarity} />
      <ProgressBar label="Prior art clearance" value={preview.prior_art} color={theme.colors.progress.priorArt} />
      <ProgressBar label="Evidence support" value={preview.evidence} color={theme.colors.progress.evidence} />

      <div className="text-[13px] font-semibold text-text-primary uppercase mt-7 mb-3.5">
        Key Findings
      </div>

      {!hasData ? (
        <div className="flex items-start gap-3 py-3.5">
          <div className="w-8 h-8 rounded-md2 flex-shrink-0" style={{ backgroundColor: theme.colors.findings.purpleBg }}></div>
          <div>
            <div className="text-[13px] font-medium text-text-primary">Awaiting Document</div>
            <div className="text-xs text-text-primary mt-1">
              Upload a patent document to start analysis.
            </div>
          </div>
        </div>
      ) : (
        preview.findings.map((f, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 py-3.5 ${
              idx !== preview.findings.length - 1 ? "border-b border-border-tertiary" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-md2 flex-shrink-0" style={{ backgroundColor: f.color }}></div>
            <div>
              <div className="text-[13px] font-medium text-text-primary">{f.label}</div>
              <div
                className="text-xs text-text-primary mt-1 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: f.text }}
              />
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={onGenerateReport}
        className="w-full text-white border-none py-3 rounded-md2 font-semibold cursor-pointer text-sm mt-5 transition-colors"
        style={{ backgroundColor: theme.colors.danger.solid }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Generate full report ↗
      </button>
    </aside>
  );
}
