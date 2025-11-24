/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        secondary: '#f5f7fa',
        accent: '#008080',
        highlight: '#2ecc71'
      }
    },
  },
  plugins: [],
}