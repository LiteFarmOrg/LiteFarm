export const getLanguageFromLocalStorage = () => {
  const selectedLanguage = localStorage.getItem('litefarm_lang');
  return selectedLanguage.includes('-') ? selectedLanguage.split('-')[0] : selectedLanguage;
};
