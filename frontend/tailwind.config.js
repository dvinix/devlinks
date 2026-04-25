/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-base': '#000000',
        'dark-surface': '#0A0A0A',
        'dark-elevated': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
        'gradient-glow': 'radial-gradient(circle at center, rgba(124, 58, 237, 0.15), transparent 70%)',
      },
    },
  },
  plugins: [],
}
