import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import ChainedBackend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import { APP_VERSION } from '../util/constants';

// Backend Fallback: https://www.i18next.com/how-to/backend-fallback

// TODO: LF-5430 Revert to re-add Khmer
// Explicit language list to exclude km
const offlineLocales = import.meta.glob('../../public/locales/{en,es,de,fr,pt,hi,pa,ml}/*.json');

i18n
  .use(ChainedBackend)
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    defaultNS: 'translation',
    nsSeparator: ':',
    fallbackLng: 'en',
    // TODO: LF-5430 Re-add Khmer
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
    ns: ['animal', 'crop', 'expense', 'revenue', 'task', 'market_directory_info', 'profitability'],
    backend: {
      queryStringParams: { v: APP_VERSION },
      backends: [
        HttpBackend,
        resourcesToBackend((lng, ns) => {
          const isAvailable = lng === i18n.language || lng === 'en';
          const loadOfflineLocale = offlineLocales[`../../public/locales/${lng}/${ns}.json`];
          if (isAvailable && loadOfflineLocale) {
            return loadOfflineLocale();
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
