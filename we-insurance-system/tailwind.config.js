/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        secondary: '#6C757D',
        success: '#28A745',
        danger: '#DC3545',
        warning: '#FFC107',
        info: '#17A2B8',
        light: '#F8F9FA',
        dark: '#343A40',
        "primary-light": '#E3F2FD',
        "primary-dark": '#004085',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

