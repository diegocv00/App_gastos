const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map slate (used for neutrals) to warm rusty oranges/browns
        slate: {
          50: '#fff7ed',  // orange-50
          100: '#ffedd5', // orange-100
          200: '#fed7aa', // orange-200
          300: '#fdba74', // orange-300
          400: '#fb923c', // orange-400
          500: '#f97316', // orange-500
          600: '#ea580c', // orange-600
          700: '#c2410c', // orange-700
          800: '#9a3412', // orange-800
          900: '#7c2d12', // orange-900 (Text Secondary)
          950: '#431407', // orange-950 (Text Primary)
        },
        background: "#FAEBDD",
        foreground: "#431407",
        primary: {
          50: '#fff7ed',
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
        card: "#fff7ed", // orange-50 (Very light cream)
        "card-foreground": "#431407",
        border: "#fed7aa", // orange-200
        input: "#fed7aa",
        ring: "#FBC38A",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
