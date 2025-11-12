import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import vue from "@vitejs/plugin-vue";
import path from 'node:path';
import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      stylus: {
        imports: [path.resolve(__dirname, './src/assets/stylus/*.styl')],
      },
    },
  },
  plugins: [
    vue(),
    VueDevTools(),
    VueI18nPlugin({
      include: path.resolve(__dirname, './src/locales/**'),
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 8000,
    open: false,
    cors: true,
    proxy: {
      '/api/tcg': {
        target: 'https://api.pokemontcg.io/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tcg/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['oh-vue-icons/icons'],
  },
  base: '/Pokedex-vue/',
});
