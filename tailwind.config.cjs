module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Source Serif 4 is the closest freely available match to
        // GH Guardian Headline used by The Guardian.
        serif: ["Source Serif 4", "Georgia", "serif"],
        sans: ["Inter", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
