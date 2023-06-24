import App from './App.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { setupLayouts } from 'virtual:generated-layouts';
import generatedRoutes from '~pages';
import { createI18n } from 'vue-i18n';
import { createHead } from '@vueuse/head';
import Toast from 'vue-toastification';
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { BiStars } from "oh-vue-icons/icons";
import pt_br from '@/locales/pt_br.json';
import en from '@/locales/en.json';


import '@/style.css';
import '@/assets/stylus/__colors.styl';
import '@/assets/stylus/__spacing.styl';
import 'vue-toastification/dist/index.css';

// Vuetify
import 'vuetify/styles';
import * as labs from 'vuetify/labs/components';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components: {
    ...labs,
    ...components,
  },
  directives,
});

addIcons(BiStars);


generatedRoutes.push({ path: '/:catchAll(.*)', redirect: '404' });
const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(generatedRoutes),
});


const i18n = createI18n({
  legacy: true,
  allowComposition: true,
  locale: 'en',
  messages: {
    en: en,
  },
});
export default i18n;

const pinia = createPinia();
const head = createHead();
const app = createApp(App);

app.component("v-icon", OhVueIcon);
app.use(i18n);
app.use(vuetify);
app.use(pinia);
app.use(head);
app.use(Toast);
app.use(router);
app.mount('#app');

