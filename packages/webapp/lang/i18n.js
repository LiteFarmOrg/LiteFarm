import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en_translation from './en/translation.json';
import en_common from './en/common.json';
import pt from './pt/translation.json';
import es from './es/translation.json';
const resources = {
  en: {
    translation: en_translation,
    common: en_common
  },
  es: {
    translation: es
  },
  pt: {
    translation: pt
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",

    keySeparator: '.', // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;