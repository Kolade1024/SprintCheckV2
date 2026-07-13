import type { Config } from "tailwindcss";

/**
 * Design tokens extracted from the SprintCheck Figma file
 * (file fZ6bmR2G4lRZDPw0KyyKgB, frame "Main" 1072:7513).
 *
 * Breakpoints map the design's three target widths:
 *   - base  -> Mobile   (up to 768px)
 *   - md    -> Tablet   (768px up to 1024px)
 *   - lg    -> Desktop  (1024px and up)
 * These match Tailwind's defaults, declared explicitly for clarity.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/docs/**/*.ts"],
  // Class-based dark mode, scoped: only the docs shell ever gets a `.dark`
  // ancestor, so the rest of the site stays light.
  darkMode: "class",
  theme: {
    screens: {
      md: "768px", // Tablet
      lg: "1024px", // Desktop
      xl: "1280px",
    },
    extend: {
      colors: {
        // Themeable neutrals — RGB triplets live in globals.css (:root / .dark)
        // so the docs can flip to dark mode; light values match the original hex.
        ink: "rgb(var(--sc-ink) / <alpha-value>)", // headings / near-black navy (#0b1023)
        body: "rgb(var(--sc-body) / <alpha-value>)", // muted body copy (#5b6375)
        // Surfaces
        surface: "rgb(var(--sc-surface) / <alpha-value>)", // #ffffff
        subtle: "rgb(var(--sc-subtle) / <alpha-value>)", // light lavender (#f6f7fe)
        // Lines
        line: "rgb(var(--sc-line) / <alpha-value>)", // #e4e8ef
        // Brand
        brand: {
          DEFAULT: "#763bf1",
          from: "#763bf1", // gradient start (purple)
          to: "#4b48ee", // gradient end (indigo)
          accent: "rgb(var(--sc-accent) / <alpha-value>)", // #6e3cf0
        },
        offwhite: "#fcfcfc",
        // Status
        success: "#4cc157",
        star: "#f59e0b",
        // Code window
        code: {
          bg: "#0b1023",
          bar: "#161a2e",
          comment: "#8b93a7",
          string: "#9ece6a",
          keyword: "#c4b5fd",
          fn: "#7aa2f7",
          punct: "#c2c8d6",
          text: "#e4e8ef",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // value -> [size, line-height]
        eyebrow: ["13px", { lineHeight: "16px", letterSpacing: "0.08em" }],
        "stat-label": ["12px", { lineHeight: "16px" }],
        small: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lead: ["18px", { lineHeight: "29.25px" }],
        "card-title": ["20px", { lineHeight: "28px" }],
        "stat-value": ["20px", { lineHeight: "28px", letterSpacing: "-0.5px" }],
        h2: ["40px", { lineHeight: "48px", letterSpacing: "-1px" }],
        h1: ["72px", { lineHeight: "75.6px", letterSpacing: "-1.8px" }],
      },
      spacing: {
        section: "96px", // standard section gutter / vertical rhythm
        18: "4.5rem",
      },
      maxWidth: {
        container: "1440px",
        content: "1248px",
        prose: "672px",
      },
      borderRadius: {
        btn: "14px",
        card: "16px",
        panel: "24px",
        hero: "28px",
        pill: "9999px",
      },
      boxShadow: {
        glass:
          "0px 1px 2px 0px rgba(11,16,35,0.04), 0px 8px 24px 0px rgba(11,16,35,0.06)",
        card: "0px 1px 2px 0px rgba(16,24,40,0.05)",
        btn: "0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)",
        glow: "0px 10px 40px -10px rgba(118,59,241,0.25)",
      },
      backgroundImage: {
        brand:
          "linear-gradient(135deg, #763bf1 0%, #4b48ee 100%)",
        "brand-text":
          "linear-gradient(130deg, #763bf1 0%, #4b48ee 100%)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.4,0,0.2,1) both",
        "fade-down": "fade-down 0.5s cubic-bezier(0.4,0,0.2,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
