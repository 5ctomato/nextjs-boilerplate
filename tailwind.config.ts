import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sodo-sans)", "Inter", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        serif: ["var(--font-lora)", "Iowan Old Style", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        // Starbucks Primary Green System
        "starbucks-green": "var(--starbucks-green)",
        "green-accent": "var(--green-accent)",
        "house-green": "var(--house-green)",
        "green-uplift": "var(--green-uplift)",
        "green-light": "var(--green-light)",
        // Starbucks Gold System (Rewards only)
        "gold": "var(--gold)",
        "gold-light": "var(--gold-light)",
        "gold-lightest": "var(--gold-lightest)",
        // Starbucks Surface & Background
        "neutral-warm": "var(--neutral-warm)",
        "ceramic": "var(--ceramic)",
        "neutral-cool": "var(--neutral-cool)",
      },
      borderRadius: {
        "pill": "50px",
      },
      boxShadow: {
        "card": "0px 0px 0.5px 0px rgba(0,0,0,0.14), 0px 1px 1px 0px rgba(0,0,0,0.24)",
        "nav": "0 1px 3px rgba(0,0,0,0.1), 0 2px 2px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.07)",
        "frap": "0 0 6px rgba(0,0,0,0.24), 0 8px 12px rgba(0,0,0,0.14)",
      },
      letterSpacing: {
        "tight": "-0.01em",
        "tighter": "-0.16px",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
}

export default config
