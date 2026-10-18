import mdx from "@mdx-js/rollup"
import react from "@vitejs/plugin-react"
import { remarkCodeHike, recmaCodeHike } from "codehike/mdx"
import { defineConfig } from "vite"

const codeHike = {
  components: { code: "Code" },
  syntaxHighlighting: { theme: "github-dark" },
}

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [
    mdx({
      remarkPlugins: [[remarkCodeHike, codeHike]],
      recmaPlugins: [[recmaCodeHike, codeHike]],
    }),
    react(),
  ],
  build: {
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    modulePreload: false,
    sourcemap: false,
    rolldownOptions: {
      output: { codeSplitting: false },
    },
  },
})
