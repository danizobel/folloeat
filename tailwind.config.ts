import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "follo-blue": "#0284C7",
        "follo-blue-dark": "#0369A1",
        "follo-blue-light": "#E0F2FE",
        "follo-red": "#EF4444",
        "follo-red-dark": "#DC2626",
        "follo-red-light": "#FEE2E2",
        "follo-slate": "#0F172A",
        "follo-slate-light": "#334155",
        "follo-sand": "#F59E0B",
        "follo-sand-light": "#FEF3C7",
        "follo-bg": "#F8FAFC",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
