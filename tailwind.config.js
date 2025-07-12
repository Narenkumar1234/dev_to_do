/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px'
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      minHeight: {
        '44': '11rem',
        'touch': '44px'
      },
      minWidth: {
        '44': '11rem',
        'touch': '44px'
      }
    }
  },
  plugins: []
}