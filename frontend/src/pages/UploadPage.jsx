import React, { useRef, useState } from "react";

const MAX_FILE_SIZE_MB = 25;
const ACCEPTED_TYPE = "application/pdf";

export default function UploadPage({ onFileUpload, isUploading }) {
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState(null);
  const [statusText, setStatusText] = useState("Click to Browse Document");

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (file.type !== ACCEPTED_TYPE && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are allowed.";
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      e.target.value = "";
      return;
    }

    setFileError(null);
    setStatusText("Processing securely in cloud...");

    await onFileUpload(file);

    setStatusText("Click to Browse Document");
    e.target.value = "";
  };

  const handleZoneClick = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleZoneClick();
    }
  };

  return (
    <div className="p-4 md:p-6">
      <input
        ref={fileInputRef}
        type="file"
        id="fileInput"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <div
        role="button"
        tabIndex={0}
        onClick={handleZoneClick}
        onKeyDown={handleKeyDown}
        className={`border-2 border-dashed rounded-2xl py-12 sm:py-16 px-5 text-center bg-bg-primary cursor-pointer transition-colors max-w-xl mx-auto mt-6
          ${isUploading ? "opacity-60 cursor-not-allowed" : "border-slate-300 hover:border-brand hover:bg-bg-secondary"}`}
      >
        <i className={`ti ${isUploading ? "ti-loader ti-spin" : "ti-cloud-upload"} text-5xl text-brand mb-4 inline-block`} aria-hidden="true"></i>
        <div className="text-lg font-semibold text-text-primary mb-2">{statusText}</div>
        <div className="text-sm text-text-tertiary">
          Upload PDF documents (max {MAX_FILE_SIZE_MB}MB) for AI-powered patent analysis
        </div>
        <button
          type="button"
          disabled={isUploading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md2 text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors mt-6 disabled:opacity-60"
        >
          Select File
        </button>
      </div>

      {fileError && (
        <div className="max-w-xl mx-auto mt-4 px-4 py-3 rounded-md2 bg-danger-bg text-danger-fg text-sm font-medium flex items-start gap-2">
          <i className="ti ti-alert-circle text-base mt-0.5" aria-hidden="true"></i>
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
}
