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




// Declare event emitter
// https://github.com/developit/mitt
window.eventBus = window.mitt();

// Utils for hash and routing
import {setHashValue, getHashValue, removeHash} from './assets/scripts/utils.js';
window.location.setHashValue = setHashValue;
window.location.getHashValue = getHashValue;
window.location.removeHash = removeHash;


// FileManager
import FileManager from './assets/scripts/FileManager.js';
window.FileManager = new FileManager();

// DataManager
import DataManager from './assets/scripts/DataManager/DataManager.js';
window.DataManager = new DataManager();

// // GUIManager
import GUIManager from './assets/scripts/GUIManager.js';
window.GUIManager = new GUIManager();




const app = createApp(App)
app.use(i18n);
app.mount('#app');
