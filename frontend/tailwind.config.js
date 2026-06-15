import { theme } from "./src/config/theme.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [theme.font.sans],
      },
      colors: {
        bg: {
          primary: theme.colors.background.primary,
          secondary: theme.colors.background.secondary,
          tertiary: theme.colors.background.tertiary,
        },
        border: {
          secondary: theme.colors.border.secondary,
          tertiary: theme.colors.border.tertiary,
        },
        text: {
          primary: theme.colors.text.primary,
          secondary: theme.colors.text.secondary,
          tertiary: theme.colors.text.tertiary,
        },
        brand: {
          DEFAULT: theme.colors.brand.primary,
          hover: theme.colors.brand.primaryHover,
          logoIconBg: theme.colors.brand.logoIconBg,
          logoIconFg: theme.colors.brand.logoIconFg,
        },
        status: {
          blue: theme.colors.status.blue,
          green: theme.colors.status.green,
          amber: theme.colors.status.amber,
          red: theme.colors.status.red,
        },
        badge: {
          analyzedBg: theme.colors.badge.analyzedBg,
          analyzedFg: theme.colors.badge.analyzedFg,
          processingBg: theme.colors.badge.processingBg,
          processingFg: theme.colors.badge.processingFg,
        },
        ring: {
          border: theme.colors.ring.border,
          bg: theme.colors.ring.bg,
          value: theme.colors.ring.value,
          label: theme.colors.ring.label,
        },
        avatar: {
          bg: theme.colors.avatar.bg,
          fg: theme.colors.avatar.fg,
        },
        patentIcon: {
          bg: theme.colors.patentIcon.bg,
          fg: theme.colors.patentIcon.fg,
        },
        danger: {
          bg: theme.colors.danger.bg,
          fg: theme.colors.danger.fg,
          solid: theme.colors.danger.solid,
        },
        findings: {
          amber: theme.colors.findings.amberBg,
          red: theme.colors.findings.redBg,
          green: theme.colors.findings.greenBg,
          purple: theme.colors.findings.purpleBg,
        },
        info: {
          blueBg: theme.colors.info.blueBg,
          blueFg: theme.colors.info.blueFg,
          yellowBg: theme.colors.info.yellowBg,
          yellowFg: theme.colors.info.yellowFg,
          greenBg: theme.colors.info.greenBg,
          greenFg: theme.colors.info.greenFg,
        },
        login: {
          accent: theme.colors.login.accent,
          accentLight: theme.colors.login.accentLight,
        },
        progress: {
          clarity: theme.colors.progress.clarity,
          priorArt: theme.colors.progress.priorArt,
          evidence: theme.colors.progress.evidence,
        },
      },
      borderRadius: {
        md2: theme.radius.md,
        lg2: theme.radius.lg,
      },
    },
  },
  plugins: [],
};
