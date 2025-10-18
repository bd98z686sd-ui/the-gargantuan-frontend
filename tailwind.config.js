export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        guardianBlue: "#052962",
        guardianRed: "#c70000",
        guardianWhite: "#f6f6f6",
        guardianText: "#121212"
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["Roboto Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
