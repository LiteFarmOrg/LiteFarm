const languageFiles = {
  fr: './fr.js',
  pt: './pt.js',
  es: './es.js',
};

export const getRruleLanguage = async (language) => {
  if (!Object.keys(languageFiles).includes(language)) {
    return { getText: (id) => id, language: null };
  }
  return await import(languageFiles[language]).then((language) => language.default);
};
