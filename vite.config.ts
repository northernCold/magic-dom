import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
// import autoImport from "unplugin-auto-import/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    crx({ manifest }),
    react(),
    tailwindcss(),
    // autoImport({
    //   imports: [
    //     {
    //       'webextension-polyfill': [['*', 'browser']],
    //     }
    //   ],
    //   dts: 'types/browser.d.ts',
    // })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssCodeSplit: true,
    emptyOutDir: true,
    outDir: 'extension',
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel.html',
      },
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    }
  },
})
