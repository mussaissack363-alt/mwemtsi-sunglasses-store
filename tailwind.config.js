/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        onyx: {
          bg: '#000000',
          panel: '#0a0a0b',
          surface: '#131315',
          line: '#232326',
          text: '#f2f1ee',
          muted: '#75767c',
          accent: '#c9a24a',
          wa: '#25D366',
          danger: '#c9564a',
        }
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      letterSpacing: {
        'ultra-wide': '0.18em',
      }
    },
  },
  plugins: [],
}
