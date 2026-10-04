/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a9f8',
          500: '#0e8ce9',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b85',
          900: '#0c3f6e',
          950: '#082849',
        },
        paper: {
          light: '#fdfcf8',
          ruled: '#d2e1f0',
          margin: '#eba0a0',
          inkBlue: '#1c3694',
          inkDark: '#232328',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        handwritten: ['Caveat', 'Kalam', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(14, 140, 233, 0.3)',
        'notebook': '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
