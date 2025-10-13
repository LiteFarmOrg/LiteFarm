import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { APP_VERSION } from '../util/constants';

// Backend Fallback: https://www.i18next.com/how-to/backend-fallback

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    defaultNS: 'translation',
    nsSeparator: ':',
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es', 'fr', 'de', 'hi', 'pa', 'ml'], // i18n allow list
    locales: ['en', 'pt', 'es', 'fr', 'de', 'hi', 'pa', 'ml'],
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'querystring'],
      lookupLocalStorage: 'litefarm_lang',
    },
    react: {
      useSuspense: true,
    },
    ns: ['crop', 'expense', 'task'],
    backend: {
      queryStringParams: { v: APP_VERSION },
      backends: [
        HttpBackend,
        resourcesToBackend((lng, ns) => {
          if (lng === i18n.language) {
            return import(`../../public/locales/${lng}/${ns}.json`);
          }
          throw new Error(`Language ${lng} not available offline`);
        }),
      ],
      backendOptions: [
        {
          loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        {},
      ],
    },
  });

export default i18n;
