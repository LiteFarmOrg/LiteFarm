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
    locales: ['en', 'pt', 'es', 'fr'],
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
    ns: [
      'certifications',
      'common',
      'crop_group',
      'crop_nutrients',
      'crop',
      'disease',
      'expense',
      'fertilizer',
      'filter',
      'gender',
      'harvest_uses',
      'message',
      'revenue',
      'role',
      'soil',
      'task',
    ],
  });

export default i18n;
