import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function useStringFilteredCrops(crops, filterString) {
  const { t } = useTranslation();
  return useMemo(() => {
    const lowerCaseFilter =
      filterString
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\W/g, '')
        .replace(/_/g, '')
        .trim() || '';
    const check = (names) => {
      for (const name of names) {
        if (
          name
            ?.toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\W/g, '')
            .replace(/_/g, '')
            .trim()
            .includes(lowerCaseFilter)
        )
          return true;
      }
      return false;
    };
    // These fields can be used in future.
    // Hence, keeping it in the comments
    // use it in the check function argument.
    // crop?.crop_common_name,
    return crops.filter((crop) =>
      check([crop?.crop_variety_name, t(`crop:${crop.crop_translation_key}`)]),
    );
  }, [crops, filterString]);
}
