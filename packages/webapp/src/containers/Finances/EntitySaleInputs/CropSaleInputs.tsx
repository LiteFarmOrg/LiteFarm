/*
 *  Copyright 2026 LiteFarm.org
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
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  CROP_VARIETY_SALE,
  CROP_VARIETY_ID,
} from '../../../components/Forms/RevenueForm/constants';
import CropSaleItem from '../../../components/Forms/RevenueForm/CropSaleItem';
import { selectManagementPlansForSale } from '../../managementPlanSlice';
import EntitySalePicker from '../../../components/Forms/RevenueForm/EntitySalePicker';
import type { CropVarietySaleTileData } from '../../../components/CropTile/CropVarietySaleTile';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import type { SelectOption } from '../../../components/Form/ReactSelect/CheckboxMultiSelect/index';

export const getCropSaleDefaultValues = (sale: CropSale | undefined) => {
  const existingSales = sale?.crop_variety_sale?.reduce<
    Record<number, Omit<CropVarietySaleRecord, 'quantity_unit'> & { quantity_unit?: SelectOption }>
  >(
    (acc, cur) => ({
      ...acc,
      [cur.crop_variety_id]: {
        crop_variety_id: cur.crop_variety_id,
        quantity: cur.quantity,
        quantity_unit: cur.quantity_unit
          ? ((getUnitOptionMap() as Record<string, SelectOption>)[cur.quantity_unit] ?? {
              label: cur.quantity_unit,
              value: cur.quantity_unit,
            })
          : undefined,
        sale_value: cur.sale_value,
      },
    }),
    {},
  );
  return {
    [CROP_VARIETY_SALE]: existingSales ?? undefined,
  };
};

interface CropVarietySaleRecord {
  crop_variety_id: number;
  quantity: number;
  quantity_unit: string | undefined;
  sale_value: number;
}

export interface CropSale {
  crop_variety_sale?: CropVarietySaleRecord[];
}

interface CropSaleInputsProps {
  sale?: CropSale;
  disabledInput: boolean;
}

export default function CropSaleInputs({ sale, disabledInput }: CropSaleInputsProps) {
  const { t } = useTranslation();
  const managementPlans = useSelector((state) =>
    selectManagementPlansForSale(state, sale?.crop_variety_sale),
  );

  // Management plans determine which crop varieties are sale-eligible,
  // but the sale row itself represents a crop variety rather than a plan.
  const { options, cropVarietyTileDataById } = useMemo(() => {
    const tileDataById: Record<number, CropVarietySaleTileData> = {};
    const optionList: SelectOption[] = [];
    for (const mp of managementPlans ?? []) {
      if (!(mp.crop_variety_id in tileDataById)) {
        tileDataById[mp.crop_variety_id] = {
          crop_variety_name: mp.crop_variety_name,
          crop_translation_key: mp.crop_translation_key,
          crop_variety_photo_url: mp.crop_variety_photo_url,
        };
        optionList.push({
          label: mp.crop_variety_name
            ? `${mp.crop_variety_name}, ${t(`crop:${mp.crop_translation_key}`)}`
            : t(`crop:${mp.crop_translation_key}`),
          value: mp.crop_variety_id,
        });
      }
    }
    optionList.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    return { options: optionList, cropVarietyTileDataById: tileDataById };
  }, [managementPlans, t]);

  const savedSalesById = sale?.crop_variety_sale?.reduce<Record<number, CropVarietySaleRecord>>(
    (acc, cur) => ({ ...acc, [cur.crop_variety_id]: cur }),
    {},
  );

  return (
    <EntitySalePicker
      disabledInput={disabledInput}
      options={options}
      savedSalesById={savedSalesById}
      fieldPrefix={CROP_VARIETY_SALE}
      entityIdFieldKey={CROP_VARIETY_ID}
      label={t('SALE.ADD_SALE.CROP_VARIETY')}
      placeholder={t('SALE.ADD_SALE.CROP_VARIETY')}
    >
      {({ option, system, currency, disabledInput }) => (
        <CropSaleItem
          key={option.value}
          cropVariety={cropVarietyTileDataById[option.value as number]}
          cropVarietyId={option.value}
          system={system}
          currency={currency}
          disabledInput={disabledInput}
        />
      )}
    </EntitySalePicker>
  );
}
