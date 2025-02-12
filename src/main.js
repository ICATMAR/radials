import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import './globalStyle.css'
import App from './App.vue'


import ca from './lang/ca.js';
import en from './lang/en.js';
import es from './lang/es.js';

// https://vue-i18n.intlify.dev/
const i18n = createI18n({
  silentFallbackWarn: true,
  silentTranslationWarn: true,
});
// Translations
i18n.global.mergeLocaleMessage('ca', ca);
i18n.global.mergeLocaleMessage('en', en);
i18n.global.mergeLocaleMessage('es', es);



const app = createApp(App)
app.use(i18n);
app.mount('#app');
