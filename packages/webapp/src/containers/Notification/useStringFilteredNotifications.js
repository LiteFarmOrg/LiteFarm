import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function useStringFilteredNotifications(notifications, filterString) {
  const { t } = useTranslation();
  return useMemo(() => {
    const lowerCaseFilter = filterString?.toLowerCase() || '';
    const check = (names) => {
      for (const name of names) {
        if (name?.toLowerCase().includes(lowerCaseFilter)) return true;
      }
      return false;
    };

    return notifications.filter((notification) => {
      const tOptions = notification.variables?.reduce((optionsSoFar, currentOption) => {
        let options = { ...optionsSoFar };
        options[currentOption.name] = currentOption.translate
          ? t(currentOption.value)
          : currentOption.value;
        return options;
      }, {});
      return check([
        t(`NOTIFICATION.${notification.translation_key}.TITLE`),
        t(`NOTIFICATION.${notification.translation_key}.BODY`, tOptions),
      ]);
    });
  }, [notifications, filterString]);
}
