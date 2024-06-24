import i18n from 'i18next';
import Backend from 'i18next-fs-backend';

i18n.use(Backend).init(
  {
    fallbackLng: 'en',
    preload: ['de', 'en', 'es', 'pt', 'fr'],
    ns: ['translation', 'crop'],
    defaultNS: 'translation',
    nsSeparator: ':',
    backend: {
      loadPath: 'src/jobs/locales/{{lng}}/{{ns}}.json',
    },
  },
  (err) => {
    if (err) return console.error(err);
  },
);

export default i18n;
