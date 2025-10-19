/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      colors: {
        guardian: {
          blue: "#052962",
          red: "#c70000"
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")]
};