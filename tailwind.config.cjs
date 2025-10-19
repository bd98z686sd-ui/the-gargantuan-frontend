/**** Tailwind config ****/
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        guardianBlue: "#052962",
        guardianRed: "#c70000",
        paper: "#f6f6f6",
        ink: "#121212"
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,0.08)"
      }
    }
  },
  corePlugins: {
    container: false
  }
}
