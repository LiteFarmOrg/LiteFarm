import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default function useSortByVarietyName(crops) {
  const { t } = useTranslation();
  return useMemo(() => {
    return crops.sort((crop_i, crop_j) => {
      const crop_i_name = getCropName(crop_i, t);
      const crop_j_name = getCropName(crop_j, t);
      return crop_i_name > crop_j_name ? 1 : -1;
    });
  }, [crops]);
}

const getCropName = (crop, t) => {
  return crop.crop_variety_name || t(`crop:${crop.crop_translation_key}`);
};
