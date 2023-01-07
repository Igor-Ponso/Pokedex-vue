import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
    VueI18nPlugin({
      include: path.resolve(__dirname, './path/to/src/locales/**'),
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 8000,
    open: false,
    cors: true,
  },
  optimizeDeps: {
    exclude: ['oh-vue-icons/icons'],
  },
  base: '/pokedex-vue/',
});
