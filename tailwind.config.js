/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#7BC9FF',
        'primary-dark': '#4BA8E8',
        'primary-light': '#EAF6FF',
        secondary: '#A8E8CF',
        tertiary: '#FFD1DC',
        neutral: '#F8FAFC',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-disabled': '#9CA3AF',
        error: '#EF4444',
        success: '#10B981',
        border: '#E5E7EB',
        'input-bg': '#EFF6FF',
      },
    },
  },
  plugins: [],
}