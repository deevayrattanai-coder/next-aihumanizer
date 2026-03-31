import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Remove source maps in production to prevent source code exposure
    sourcemap: false,
    // Minify and mangle variable names
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,     // Remove all console.* calls
        drop_debugger: true,    // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
      mangle: {
        toplevel: true,         // Mangle top-level variable names
      },
      format: {
        comments: false,        // Remove all comments
      },
    },
  },
}));
