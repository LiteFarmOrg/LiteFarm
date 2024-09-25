import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import backend from 'i18next-xhr-backend';
import { APP_VERSION } from '../util/constants';

i18n
  .use(backend)
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    defaultNS: 'translation',
    nsSeparator: ':',
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es', 'fr', 'de'],
    locales: [
      'en',
      'pt',
      'es',
      'fr',
      'de',
      // 'hi', 'pa', 'ml'
    ],
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'querystring'],
      lookupLocalStorage: 'litefarm_lang',
    },
    react: {
      useSuspense: true,
    },
    backend: {
      queryStringParams: { v: APP_VERSION },
    },
    ns: ['crop', 'expense', 'task'],
  });

export default i18n;
