import { getLanguageFromLocalStorage } from './getLanguageFromLocalStorage';
import { useTranslation } from 'react-i18next';
import { getLocalizedDateString } from './moment';

const useTranslationUtil = () => {
  const { t } = useTranslation();
  const currentLang = getLanguageFromLocalStorage();

  const getNotificationTitle = (title, variables) => {
    const tOptions = getTranslationOptions(variables);
    return title.translation_key ? t(title.translation_key, tOptions) : title[currentLang];
  };

  const getTranslationOptions = (variables) => {
    const tOptions = variables?.reduce((optionsSoFar, currentOption) => {
      let options = { ...optionsSoFar };
      options[currentOption.name] = currentOption.translate
        ? t(currentOption.value)
        : currentOption.value;
      return options;
    }, {});

    // Localize YYYY-MM-DD date string
    if (tOptions && 'date' in tOptions) {
      tOptions.date = getLocalizedDateString(tOptions.date, {
        month: 'long',
        day: 'numeric',
      });
    }

    return tOptions;
  };

  const getNotificationBody = (body, variables) => {
    const tOptions = getTranslationOptions(variables);
    return body.translation_key ? t(body.translation_key, tOptions) : body[currentLang];
  };

  return { getNotificationTitle, getNotificationBody, getTranslationOptions };
};

export default useTranslationUtil;
