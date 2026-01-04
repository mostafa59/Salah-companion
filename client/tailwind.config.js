/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'teal': {
          50: '#f0fdf4',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e'
        },
        cream: '#FCFCF9',
        gold: '#D4A574'
      }
    }
  },
  plugins: [],
  direction: 'rtl'
};
