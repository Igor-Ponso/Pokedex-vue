import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';

import en from './locales/en.json';

import '@/style.css';
import '@/assets/stylus/__colors.styl';
import '@/assets/stylus/__spacing.styl';

const i18n = createI18n({
  legacy: true,
  allowComposition: true,
  locale: 'en',
  messages: {
    en: en,
  },
});
const pinia = createPinia();
const app = createApp(App);

app.use(i18n);
app.use(pinia);
app.mount('#app');
