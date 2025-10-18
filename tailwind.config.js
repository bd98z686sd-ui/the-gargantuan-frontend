export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bodoni Moda"', 'serif'],
        ui: ['"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      colors: {
        mustard: "#d2a106",
        accent: "#ff5a2b",
      },
    },
  },
  plugins: [],
}
