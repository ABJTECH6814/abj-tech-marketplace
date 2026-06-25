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
        "mokolo-red": "#D72638",
        "mokolo-red-dark": "#A51C2B",
        "mokolo-red-light": "#FFF0F2",
        "mokolo-black": "#0F0F0F",
        "mokolo-black-soft": "#1A1A1A",
        "mokolo-gray": {
          50: "#F9F9F9",
          100: "#F1F5F9",
          200: "#E5E5E5",
          600: "#666666",
        },
      },
      fontFamily: {
        // Reliées aux variables injectées par next/font dans layout.tsx
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
