/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        cream: "#F8EFDD",
        ivory: "#FFFFFF",

        forest: "#1F7A45",
        "forest-dark": "#14532D",
        "forest-light": "#2E8B57",

        gold: "#D9A441",
        goldDark: "#A9761E",

        maroon: "#6B1416",
        maroonDark: "#3E0B0C",

        clay: "#C1522A",
        terracotta: "#C1522A",

        ink: "#241408",

        champagne: "#FFF7EA",

        muted: "#6B7280",

        stoneline: "#E6D3B3",
      },

      borderRadius: {
        xl2: "1rem",
      },

      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,.08)",
        card: "0 6px 20px rgba(0,0,0,.08)",
      },

      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },

      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(36,20,8,0.06) 1px, transparent 0)",
      },
    },
  },

  plugins: [],
};