/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#161622",
        secondary: "#FF9C01",
        secondary100: "#FF9001",
        gray: "#CDCDE0",
        gray100: "#878787",
        gray200: "#232533",
        black: "#000000",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};