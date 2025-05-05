/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',  // Blue-600 (strong, primary action)
          light: '#3B82F6',     // Blue-500 (hover states)
          dark: '#1D4ED8',       // Blue-700 (active/darker elements)
          subtle: '#93C5FD'      // Blue-300 (backgrounds/accents)
        },
        math: {
          DEFAULT: '#0284C7',   // Sky-600 (distinct from primary)
          dark: '#0369A1',       // Sky-700
          light: '#0EA5E9'       // Sky-500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        math: ['Latin Modern Math', 'STIX Two Text', 'serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ],
}

