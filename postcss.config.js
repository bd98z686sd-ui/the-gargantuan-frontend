// PostCSS configuration for Tailwind CSS
// We use the standard tailwindcss and autoprefixer plugins rather than
// @tailwindcss/postcss because the latter may be private or otherwise
// unavailable on some package registries (causing installation failures on
// platforms such as Vercel).  This configuration mirrors the default setup
// recommended by the Tailwind CSS documentation.
export default {
  plugins: {
    tailwindcss: {},
  },
};