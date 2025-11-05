import defaultTheme from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss"; 

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          300: "#6ED3E1",
          400: "#35B8CF",
          500: "#0097B2",
          600: "#00A7C5",
        },
        base: {
          black: "#03090C",
          dark: "#0A1014",
          white: "#E6EEF2",
        },
        accent: {
          silver: "#D3DEE4",
          teal: "#0BA8B0",
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["Orbitron", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      backdropBlur: {
        xl: "28px",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
