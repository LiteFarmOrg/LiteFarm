import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import backend from 'i18next-xhr-backend';

i18n
  .use(backend)
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    ns: [
      'translation',
      'crop',
      'common',
      'disease',
      'task',
      'expense',
      'fertilizer',
      'message',
      'gender',
      'role',
      'harvest_uses',
      'soil',
    ],
    defaultNS: 'translation',
    fallbackLng: 'en',
    detection: {
      lookupLocalStorage: 'litefarm_lang',
    },
    keySeparator: '.',

    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
