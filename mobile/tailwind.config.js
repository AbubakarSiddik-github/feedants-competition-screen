/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#1a9e8f",
          light: "#f0faf9",
          dark: "#147a6e",
        },
      },
    },
  },
  plugins: [],
};
