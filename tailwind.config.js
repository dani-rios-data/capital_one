/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-900': '#0A2351',
        'blue-800': '#0C2D63',
        'blue-700': '#1976D2',
        'red-600': '#DC2626',
        'gray-50': '#F9FAFB',
        'gray-100': '#F3F4F6',
        'gray-200': '#E5E7EB',
        'gray-600': '#4B5563',
        'gray-700': '#374151',
        'gray-800': '#1F2937',
      },
      spacing: {
        '24': '6rem',
        '28': '7rem',
      },
      zIndex: {
        '40': '40',
        '50': '50',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
} 