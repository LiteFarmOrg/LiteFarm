import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import english from './en';
import spanish from './es';
import french from './fr';
import portuguese from './pt';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: english,
  es: spanish,
  pt: portuguese,
  fr: french,
};

i18n
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      lookupLocalStorage: 'litefarm_lang',
    },
    keySeparator: '.',

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
