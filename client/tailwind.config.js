/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // <--- ADD THIS LINE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          600: '#218084', // Our primary brand color
          800: '#0f4f52', // Darker teal
        },
        cream: '#FCFCF9', // Our background color
      }
    },
  },
  plugins: [],
}
