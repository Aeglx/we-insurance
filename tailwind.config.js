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
    fontSize: {
      xs: '12px',
      sm: '12px',
      base: '12px',
      lg: '12px',
      xl: '12px',
      '2xl': '12px',
      '3xl': '12px',
      '4xl': '12px',
      '5xl': '12px',
      '6xl': '12px',
      '7xl': '12px',
      '8xl': '12px',
      '9xl': '12px',
    },
  },
  plugins: [],
}

