import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Crop = {
  crop_translation_key: string;
  crop_genus?: string | null;
  crop_specie?: string | null;
};

type CropVariety = {
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
        .replace(/\W/g, '')
        .replace(/_/g, '')
        .trim() || '';
    const check = (names: (string | null | undefined)[]) => {
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
    // crop_common_name has translation, other fields keep as is
    return crops.filter((crop) =>
      check([
        t(`crop:${crop.crop_translation_key}`), // crop.crop_common_name
        crop?.crop_genus, // crop.crop_genus
        crop?.crop_specie, // crop.crop_specie
        crop?.crop_variety_name, // crop_variety.crop_variety_name
        crop?.crop_varietal, // crop_variety.crop_varietal
        crop?.crop_cultivar, // crop_variety.crop_cultivar
      ]),
    );
  }, [crops, filterString]);
}
