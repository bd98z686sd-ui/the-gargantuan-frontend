/**
 * Minimal PostCSS configuration.
 *
 * Vercel attempts to load PostCSS plugins declared in this file.  Previous
 * versions of the project referenced the Tailwind CSS plugin here, which
 * caused builds to fail when Tailwind was removed from the dependencies.
 *
 * By exporting an empty plugins object we avoid loading any external
 * PostCSS plugins.  CSS will still be processed by Vite’s default
 * configuration and vendor prefixes will be added by the built‑in
 * autoprefixer (no need to specify it here).
 */
module.exports = {
  plugins: {},
};