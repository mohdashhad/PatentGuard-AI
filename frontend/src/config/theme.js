// ============================================================
// THEME / COLOR CONFIGURATION FILE
// ------------------------------------------------------------
// Change any value here to re-theme the entire application.
// These values are consumed by tailwind.config.js (as CSS vars)
// and are also exported for direct use in JS (e.g. progress bars,
// inline styles, charts, etc.)
// ============================================================

export const theme = {
  font: {
    sans: "'Inter', system-ui, sans-serif",
  },

  colors: {
    background: {
      primary: "#ffffff",
      secondary: "#f8fafc",
      tertiary: "#f1f5f9",
    },
    border: {
      secondary: "#e2e8f0",
      tertiary: "#e2e8f0",
    },
    text: {
      primary: "#0f172a",
      secondary: "#334155",
      tertiary: "#64748b",
    },

    // Brand / accent colors
    brand: {
      primary: "#534AB7",
      primaryHover: "#3C3489",
      logoIconBg: "#3C3489",
      logoIconFg: "#CECBF6",
    },

    // Status dot colors
    status: {
      blue: "#378ADD",
      green: "#639922",
      amber: "#BA7517",
      red: "#E24B4A",
    },

    // Badges
    badge: {
      analyzedBg: "#EAF3DE",
      analyzedFg: "#3B6D11",
      processingBg: "#FAEEDA",
      processingFg: "#854F0B",
    },

    // Right panel / ring chart
    ring: {
      border: "#C4B5FD",
      bg: "#F5F3FF",
      value: "#312E81",
      label: "#7C3AED",
    },

    // Progress bars
    progress: {
      clarity: "#7A69E6",
      priorArt: "#B4782A",
      evidence: "#6E9B34",
    },

    // Avatar
    avatar: {
      bg: "#C4B5FD",
      fg: "#312E81",
    },

    // Patent icon
    patentIcon: {
      bg: "#EEEDFE",
      fg: "#534AB7",
    },

    // Danger / destructive actions
    danger: {
      bg: "#FCEBEB",
      fg: "#A32D2D",
      solid: "#ef4444",
    },

    // Finding card colors (used in key findings + claim review)
    findings: {
      amberBg: "#FAEDD4",
      redBg: "#FBE5E5",
      greenBg: "#E7F1DB",
      purpleBg: "#EAE6FB",
    },

    // Info / informational boxes
    info: {
      blueBg: "#e0f2fe",
      blueFg: "#0369a1",
      yellowBg: "#fef9c3",
      yellowFg: "#854d0e",
      greenBg: "#dcfce7",
      greenFg: "#166534",
    },

    // Login page accent (used for gradient / focus rings)
    login: {
      accent: "#534AB7",
      accentLight: "#EEEDFE",
    },
  },

  radius: {
    md: "8px",
    lg: "12px",
  },
};

export default theme;
