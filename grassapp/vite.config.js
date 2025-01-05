import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/GrassAppSitev3/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      'three': 'three',
      '@tweenjs/tween.js': '@tweenjs/tween.js'
    }
  }
}); 