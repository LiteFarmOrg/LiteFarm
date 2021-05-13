import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function useStringFilteredCrops(crops, filterString) {
  const { t } = useTranslation();
  return useMemo(() => {
    const lowerCaseFilter = filterString?.toLowerCase() || '';
    const check = (names) => {
      for (const name of names) {
        if (name?.toLowerCase().includes(lowerCaseFilter)) return true;
      }
      return false;
    };
    return crops.filter((crop) =>
      check([
        crop?.crop_common_name,
        crop?.crop_variety_name,
        t(`crop:${crop.crop_translation_key}`),
      ]),
    );
  }, [crops, filterString]);
}
