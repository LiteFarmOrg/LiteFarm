import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Crop = {
  crop_translation_key: string;
  crop_genus?: string | null;
  crop_specie?: string | null;
};

type CropVariety = {
  crop_translation_key: string;
  crop_variety_name?: string;
  crop_varietal?: string | null;
  crop_cultivar?: string | null;
};

export default function useStringFilteredCrops(
  crops: (Crop | CropVariety)[],
  filterString: string,
) {
  const { t } = useTranslation();
  return useMemo(() => {
    const lowerCaseFilter =
      filterString
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^\p{L}0-9]/gu, '')
        .trim() || '';
    const check = (name: string | null | undefined) => {
      return name
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^\p{L}0-9}]/gu, '')
        .trim()
        .includes(lowerCaseFilter);
    };
    // crop_common_name has translation, other fields keep as is
    return crops.filter((crop) => {
      if (check(t(`crop:${crop.crop_translation_key}`))) {
        return true;
      }
      const keys = [
        'crop_genus', // crop.crop_genus
        'crop_specie', // crop.crop_specie
        'crop_variety_name', // crop_variety.crop_variety_name
        'crop_varietal', // crop_variety.crop_varietal
        'crop_cultivar', // crop_variety.crop_cultivar
      ];
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] in crop && check(crop[keys[i] as keyof typeof crop])) {
          return true;
        }
      }
      return false;
    });
  }, [crops, filterString]);
}
