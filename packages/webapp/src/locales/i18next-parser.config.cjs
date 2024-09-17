module.exports = {
  //TODO: set keepRemoved to false after release
  keepRemoved: true,
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  sort: true,
  defaultValue: 'MISSING',
  locales: [
    'en',
    'es',
    'pt',
    'fr',
    'de',
    //  'hi', 'pa', 'ml'
  ],
};
