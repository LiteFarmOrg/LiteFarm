import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en_translation from './en/translation.json';
import en_common from './en/common.json';
import pt from './pt/translation.json';
import pt_common from './pt/common.json';
import fr from './fr/translation.json';
import fr_common from './fr/common.json';
import es from './es/translation.json';
import es_common from './es/translation.json';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: en_translation,
    common: en_common,
  },
  es: {
    translation: es,
    common: es_common,
  },
  pt: {
    translation: pt,
    common: pt_common,
  },
  fr: {
    translation: fr,
    common: fr_common,
  },
};

i18n
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      lookupLocalStorage: 'litefarm_lang',
    },
    keySeparator: '.', // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
