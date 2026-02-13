import plugin from 'tailwindcss/plugin'; // 1. Importar plugin

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        background: "#FAEBDD",
        foreground: "#431407",
        primary: {
          50: '#fbce97ff',
          100: '#FAEBDD',
          200: '#fed7aa',
          300: '#FAD289',
          400: '#FAAE89',
          500: '#FBC38A',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          DEFAULT: "#FBC38A",
        },
        card: "#fff7ed",
        "card-foreground": "#431407",
        border: "#fed7aa",
        input: "#fed7aa",
        ring: "#FBC38A",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [
    // 2. Agregar el plugin aquí
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.chart-no-select': {
          userSelect: 'none',
          '& .recharts-wrapper': { outline: 'none !important' },
          '& .recharts-surface': { outline: 'none !important' },
          '& text': {
            userSelect: 'none !important',
            pointerEvents: 'none'
          },
          '& *:focus': { outline: 'none !important' },
        }
      })
    })
  ],
};