/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container-high": "#e6e8ea",
        "on-surface": "#191c1e",
        "on-surface-variant": "#42474f",
        "outline": "#727780",
        "outline-variant": "#c2c7d1",
        "primary": "#00355f",
        "on-primary": "#ffffff",
        "primary-container": "#0f4c81",
        "primary-fixed-dim": "#a0c9ff",
        "secondary": "#914d00",
        "secondary-container": "#fc9430",
      },
      spacing: {
        "margin-desktop": "32px",
        "margin-mobile": "16px",
        "sidebar-width": "260px",
        "gutter": "24px",
        "container-max": "1440px",
        "stack-lg": "32px",
      },
      fontFamily: {
        "body-lg": ["Inter", "sans-serif"],
        "title-md": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "mono-sm": ["Inter", "monospace"],
      }
    },
  },
  plugins: [],
}