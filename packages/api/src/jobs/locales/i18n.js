const i18n = require('i18next');
const Backend = require('i18next-fs-backend');

i18n
  .use(Backend)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'es', 'pt'],
    ns: ['translation', 'crop'],
    defaultNS: 'translation',
    backend: {
      loadPath: 'src/jobs/locales/{{lng}}/{{ns}}.json',
    },
  }, (err, t) => {
    if (err) return console.error(err)
    console.log('i18next is ready...');
  });

module.exports = i18n;
