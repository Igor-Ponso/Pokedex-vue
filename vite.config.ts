import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'node:path';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Pages from 'vite-plugin-pages';
import Inspect from 'vite-plugin-inspect';
import Layouts from 'vite-plugin-vue-layouts';

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
    AutoImport({
      dts: '@types/auto-imports.d.ts',
      imports: ['vue', '@vueuse/core', '@vueuse/head', 'vue-router'],
    }),
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'default',
    }),
    Pages({
      extensions: ['vue'],
    }),
    Components({
      extensions: ['vue'],
      include: [/\.vue$/, /\.vue\?vue/],
      dirs: [
        'src/components/LayoutCompositions',
        'src/components',
        'src/widgets',
      ],
      dts: '@types/components.d.ts',
      directoryAsNamespace: true,
    }),
    Inspect(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    cors: true,
  },
  base: '/',
});
