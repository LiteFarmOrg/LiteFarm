/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useTranslation } from 'react-i18next';
import { PRODUCT_FIELD_NAMES } from '../types';

const { MOISTURE_CONTENT, DRY_MATTER_CONTENT, N, P, K, CA, MG, S, CU, MN, B, AMMONIUM, NITRATE } =
  PRODUCT_FIELD_NAMES;

const useInputsInfo = () => {
  const { t } = useTranslation();

  return {
    moistureDrymatterContents: [
      { name: MOISTURE_CONTENT, label: t('ADD_PRODUCT.MOISTURE_CONTENT') },
      { name: DRY_MATTER_CONTENT, label: t('ADD_PRODUCT.DRY_MATTER_CONTENT') },
    ],
    npk: [
      { name: N, label: t('ADD_PRODUCT.NITROGEN') },
      { name: P, label: t('ADD_PRODUCT.PHOSPHOROUS') },
      { name: K, label: t('ADD_PRODUCT.POTASSIUM') },
    ],
    additionalNutrients: [
      { name: CA, label: t('ADD_PRODUCT.CALCIUM') },
      { name: MG, label: t('ADD_PRODUCT.MAGNESIUM') },
      { name: S, label: t('ADD_PRODUCT.SULFUR') },
      { name: CU, label: t('ADD_PRODUCT.COPPER') },
      { name: MN, label: t('ADD_PRODUCT.MANGANESE') },
      { name: B, label: t('ADD_PRODUCT.BORON') },
    ],
    ammoniumNitrate: [
      { name: AMMONIUM, label: t('ADD_PRODUCT.AMMONIUM') },
      { name: NITRATE, label: t('ADD_PRODUCT.NITRATE') },
    ],
  };
};

export default useInputsInfo;
