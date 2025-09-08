import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'path'; // <<--- ESTA LINHA ESTAVA FALTANDO


export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },  
  server: {
    port: 5173,
  },
  define: {
    'process.env': {},
  },
  
});