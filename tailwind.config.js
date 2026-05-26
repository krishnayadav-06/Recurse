/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'surface': '#FFFFFF',
        'ink': '#111827',
        'muted': '#6B7280',
        'border-light': '#E5E7EB', // keeping normal border utility working, using custom names if needed
        'wash': '#F9FAFB',
        'signal': '#2563EB',
        'dark': '#111827',
        'ember': '#E8490F',
      }
    },
  },
  plugins: [],
}
