/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4f46e5",
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
        },
        surface: {
          light: "#f8fafc",
          DEFAULT: "#f1f5f9",
          dark: "#0f172a",
          "dark-alt": "#1e293b",
        },
      },
      fontFamily: {
        handwriting: ['Caveat', 'Comic Sans MS', 'cursive'],
      },
      backgroundImage: {
        'hero-pattern': 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
      },
      animation: {
        grain: 'grain 0.5s steps(1) infinite',
        flicker: 'flicker 8s ease-in-out infinite',
        fogDrift1: 'fogDrift 45s linear infinite',
        fogDrift2: 'fogDrift 55s linear infinite reverse',
        fogDrift3: 'fogDrift 40s linear infinite',
        fogDrift4: 'fogDrift 50s linear infinite reverse',
      },
      keyframes: {
        fogDrift: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -1%)' },
          '30%': { transform: 'translate(1%, 0%)' },
          '50%': { transform: 'translate(-1%, 1%)' },
          '70%': { transform: 'translate(1%, -1%)' },
          '90%': { transform: 'translate(0%, 1%)' },
        },
        flicker: {
          '0%, 97%, 100%': { opacity: '0' },
          '97.5%': { opacity: '1' },
          '98%': { opacity: '0' },
          '98.5%': { opacity: '0.5' },
          '99%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
