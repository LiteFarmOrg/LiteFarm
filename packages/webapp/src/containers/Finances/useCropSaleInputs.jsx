/*
 *  Copyright 2023 LiteFarm.org
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

import { useMemo } from 'react';
import {
  CROP_VARIETY_SALE,
  CROP_VARIETY_ID,
} from '../../components/Forms/GeneralRevenue/constants';
import CropSaleItem from '../../components/Forms/GeneralRevenue/CropSaleItem';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../userFarmSlice';
import { selectManagementPlansForSale } from '../managementPlanSlice';
import useEntitySaleInputs from './useEntitySaleInputs';

export const getCropSaleDefaultValues = (sale) => {
  const existingSales = sale?.crop_variety_sale?.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.crop_variety_id]: {
        crop_variety_id: cur.crop_variety_id,
        quantity: cur.quantity,
        quantity_unit: cur.quantity_unit,
        sale_value: cur.sale_value,
      },
    }),
    {},
  );
  return {
    [CROP_VARIETY_SALE]: existingSales ?? undefined,
  };
};

export default function useCropSaleInputs(
  reactHookFormFunctions,
  sale,
  currency,
  disabledInput,
  revenueTypes,
  selectedTypeOption,
) {
  const { t } = useTranslation();
  const managementPlans = useSelector((state) =>
    selectManagementPlansForSale(state, sale?.crop_variety_sale),
  );
  const system = useSelector(measurementSelector);

  const selectedRevenueType = revenueTypes?.find(
    (rt) => rt.revenue_type_id === selectedTypeOption?.value,
  );

  // Uses crop_generated until the backend migration (LF-5270/LF-5271) is merged;
  // will switch to entity_type === 'crop' in the animal sale wire-up PR (LF-5274).
  const isActive = !!selectedRevenueType?.crop_generated;

  const options = useMemo(() => {
    if (!managementPlans?.length) {
      return [];
    }
    const seen = new Set();
    const result = [];
    for (const mp of managementPlans) {
      if (!seen.has(mp.crop_variety_id)) {
        result.push({
          label: mp.crop_variety_name
            ? `${mp.crop_variety_name}, ${t(`crop:${mp.crop_translation_key}`)}`
            : t(`crop:${mp.crop_translation_key}`),
          value: mp.crop_variety_id,
          data: mp,
        });
        seen.add(mp.crop_variety_id);
      }
    }
    result.sort((a, b) => a.label.localeCompare(b.label));
    return result;
  }, [managementPlans, t]);

  const savedSalesById = sale?.crop_variety_sale?.reduce(
    (acc, cur) => ({ ...acc, [cur.crop_variety_id]: cur }),
    {},
  );

  return useEntitySaleInputs({
    reactHookFormFunctions,
    currency,
    disabledInput,
    isActive,
    options,
    savedSalesById,
    fieldPrefix: CROP_VARIETY_SALE,
    entityIdFieldKey: CROP_VARIETY_ID,
    ItemComponent: CropSaleItem,
    system,
    emptyMessage: t('SALE.ADD_SALE.CROP_REQUIRED'),
    placeholder: t('SALE.ADD_SALE.CROP_VARIETY'),
  });
}
