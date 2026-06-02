import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./hooks/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./stores/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"]
      },
      colors: {
        bio: {
          bg: "#020817",
          panel: "#0a1628",
          cyan: "#00d4ff",
          violet: "#7c3aed",
          green: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#22c55e",
          ice: "#f0f9ff",
          muted: "#94a3b8"
        }
      },
      boxShadow: {
        neon: "0 0 24px rgba(0, 212, 255, 0.36)",
        card: "0 0 30px rgba(0, 212, 255, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)"
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #020817 0%, #0a1628 50%, #0d0a2e 100%)",
        "button-gradient": "linear-gradient(90deg, #00d4ff, #7c3aed)",
        "card-gradient": "linear-gradient(145deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))",
        "alert-gradient": "linear-gradient(135deg, #ef4444, #991b1b)"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        pulseRing: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.18)", opacity: "0.16" }
        },
        scan: {
          "0%": { transform: "translateY(-20%)" },
          "100%": { transform: "translateY(120%)" }
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" }
        }
      },
      animation: {
        shimmer: "shimmer 2.4s infinite",
        pulseRing: "pulseRing 2s ease-in-out infinite",
        scan: "scan 2.2s ease-in-out infinite",
        shake: "shake 0.32s ease-in-out"
      }
    }
  },
  plugins: [animate]
};

export default config;
