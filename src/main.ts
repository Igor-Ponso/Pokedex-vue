import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiStars, BiHeart, BiHeartFill, BiArrowsAngleExpand } from "oh-vue-icons/icons";
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import type { PluginOptions } from 'vue-toastification';
import Toast from 'vue-toastification';
import { POSITION } from 'vue-toastification';
import App from './App.vue';


import '@/assets/stylus/__colors.styl';
import '@/assets/stylus/__spacing.styl';
import '@/style.css';
import '@/assets/styles/dark-mode.css';
import 'vue-toastification/dist/index.css';

addIcons(BiStars, BiHeart, BiHeartFill, BiArrowsAngleExpand);


import en from './locales/en.json' with { type: 'json' };
import pt from './locales/pt.json' with { type: 'json' };

// Detecta o idioma do navegador
const getBrowserLanguage = (): string => {
  const savedLang = localStorage.getItem('userLanguage');
  if (savedLang) return savedLang;

  const browserLang = navigator.language || (navigator as any).userLanguage;

  // Se for português (pt, pt-BR, pt-PT), retorna 'pt', senão 'en'
  return browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
};

const i18n = createI18n({
  legacy: true,
  allowComposition: true,
  locale: getBrowserLanguage(),
  fallbackLocale: 'en',
  messages: {
    en: en,
    pt: pt,
  },
});

const pinia = createPinia();
const app = createApp(App);
app.component("v-icon", OhVueIcon);
app.use(i18n);
const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 3500,
  closeOnClick: true,
  draggable: true,
  hideProgressBar: false,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  showCloseButtonOnHover: true,
  transition: 'Vue-Toastification__bounce'
};

app.use(Toast, toastOptions);
app.use(pinia);
app.mount('#app');
