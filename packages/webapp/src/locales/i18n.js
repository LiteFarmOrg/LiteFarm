import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import backend from 'i18next-xhr-backend';

i18n
  .use(backend)
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    defaultNS: 'translation',
    fallbackLng: 'en',
    debug: false,
    detection: {
      lookupLocalStorage: 'litefarm_lang',
    },

    react: {
      useSuspense: true,
    },
    backend: {
      queryStringParams: { v: '3.0.3' },
    },
  });

export default i18n;
