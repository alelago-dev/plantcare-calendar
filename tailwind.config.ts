import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f5f7ef",
        moss: {
          700: "#2f4f3e",
          800: "#223a2f",
          900: "#1a2c23",
          950: "#162015"
        },
        mint: {
          50: "#effae8",
          100: "#e4f3dc"
        },
        leaf: {
          50: "#f1f8ed",
          100: "#dff0d6",
          500: "#4f8f38",
          700: "#2f5f25",
          900: "#183414"
        },
        soil: {
          100: "#f1e3d2",
          500: "#9b6b43"
        },
        sky: {
          100: "#d9edf7",
          500: "#3f88a8"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 52, 20, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
