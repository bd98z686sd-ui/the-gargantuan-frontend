import { defineConfig } from 'vite'
// We omit the React plugin to avoid pulling in private dependencies which
// may be blocked on certain registries.  Vite's built-in esbuild loader
// will still transform JSX using the automatic runtime.
export default defineConfig({})
