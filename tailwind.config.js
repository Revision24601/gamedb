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
        orb1: 'orb1 25s ease-in-out infinite',
        orb2: 'orb2 30s ease-in-out infinite',
        orb3: 'orb3 35s ease-in-out infinite',
      },
      keyframes: {
        orb1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(80px, 40px)' },
          '66%': { transform: 'translate(-40px, 80px)' },
        },
        orb2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(-60px, -30px)' },
          '66%': { transform: 'translate(40px, -60px)' },
        },
        orb3: {
          '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { transform: 'translate(-50%, -50%) scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
