import { defineConfig } from 'vite';
export default defineConfig({
  // Relative asset URLs work under /<repository>/ on GitHub Pages as well as /.
  base:'./',
  build:{rollupOptions:{output:{manualChunks:{three:['three']}}}},
  server:{host:'127.0.0.1'},
});
