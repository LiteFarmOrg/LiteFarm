import { getLanguageFromLocalStorage } from './getLanguageFromLocalStorage';
import { useTranslation } from 'react-i18next';

const useTranslationUtil = () => {
  const { t } = useTranslation();
  const currentLang = getLanguageFromLocalStorage();

  const getNotificationTitle = (title) => {
    return title.translation_key ? t(title.translation_key) : title[currentLang];
  };

  const getTranslationOptions = (variables) => {
    return variables?.reduce((optionsSoFar, currentOption) => {
      let options = { ...optionsSoFar };
      options[currentOption.name] = currentOption.translate
        ? t(currentOption.value)
        : currentOption.value;
      return options;
    }, {});
  };

  const getNotificationBody = (body, variables) => {
    const tOptions = getTranslationOptions(variables);
    return body.translation_key ? t(body.translation_key, tOptions) : body[currentLang];
  };

  return { getNotificationTitle, getNotificationBody, getTranslationOptions };
};

export default useTranslationUtil;
