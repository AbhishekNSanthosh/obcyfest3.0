/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/common/**/*.{js,ts,jsx,tsx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      slk: {
        regular: "#133c25",
        light: "#239254",
        dark: "#d5e6dc",
        black: {
          100: "#161617",
          200: "#151515",
          300: "#0B0B0C"
        },
      },
      white: "#ffffff",
      black: {
        50: '#f6f6f6',
        100: '#e7e7e7',
        200: '#d1d1d1',
        300: '#b0b0b0',
        400: '#888888',
        500: '#6d6d6d',
        600: '#5d5d5d',
        700: '#4f4f4f',
        800: '#454545',
        900: '#3d3d3d',
        950: '#000000',
      },
      gray: {
        100: "#f7fafc",
        200: "#edf2f7",
        300: "#e2e8f0",
        400: "#cbd5e0",
        500: "#a0aec0",
        600: "#718096",
        700: "#4a5568",
        800: "#2d3748",
        900: "#1a202c",
      },
      yellow: {
        50: '#feffe4',
        100: '#fcffc4',
        200: '#f7ff90',
        300: '#edff50',
        400: '#dfff1b',
        500: '#c0e600',
        600: '#95b800',
        700: '#708b00',
        800: '#586d07',
        900: '#4a5c0b',
        950: '#263400',
      },      
      red: {
        400: "#f87171",
        500: "#ef4444",
      },
      green: {
        400: "#4ade80",
      },
      purple: {
        800: "#6b21a8",
      }
    },
    extend: {},
  },
  plugins: [],
};
