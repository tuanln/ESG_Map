/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'esg-green': '#22c55e',
        'esg-blue': '#3b82f6',
        'esg-red': '#ef4444',
        'esg-yellow': '#eab308',
        'esg-dark': '#0f172a',
        'esg-darker': '#020617',
        'esg-card': '#1e293b',
        'esg-border': '#334155',
      },
    },
  },
  plugins: [],
}
