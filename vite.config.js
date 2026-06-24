import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your repo name for GitHub Pages, e.g. '/limbus-identity-leveler/'
// If deploying to a custom domain or username.github.io root repo, set base to '/'
export default defineConfig({
  plugins: [react()],
  base: './',
})
