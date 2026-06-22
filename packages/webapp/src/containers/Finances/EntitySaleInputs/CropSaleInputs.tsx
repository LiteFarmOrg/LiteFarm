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
  MEASURED_BY_UNIT,
} from '../../../components/Forms/RevenueForm/constants';
import { getMeasuredByFromUnit } from '../util';
import CropSaleItem from '../../../components/Forms/RevenueForm/CropSaleItem';
import { cropVarietiesSelector, cropVarietyOptionsSelector } from '../../cropVarietySlice';
import { measurementSelector } from '../../userFarmSlice';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import EntitySalePicker from '../../../components/Forms/RevenueForm/EntitySalePicker';
import type { CropVarietySaleTileData } from '../../../components/CropTile/CropVarietySaleTile';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import type { SelectOption } from '../../../components/Form/ReactSelect/CheckboxMultiSelect/index';
import { getNoOptionsMessage } from '../util';

export const getCropSaleDefaultValues = (sale: CropSale | undefined) => {
  const existingSales = sale?.crop_variety_sale?.reduce<
    Record<
      number,
      Omit<CropVarietySaleRecord, 'quantity_unit'> & {
        quantity_unit?: SelectOption;
        measured_by: string;
      }
    >
  >(
    (acc, cur) => ({
      ...acc,
      [cur.crop_variety_id]: (() => {
        const measuredBy = getMeasuredByFromUnit(cur.quantity_unit);
        return {
          crop_variety_id: cur.crop_variety_id,
          quantity: cur.quantity,
          measured_by: measuredBy,
          // A unit (count) measure has no convertible unit, so it carries no SelectOption.
          quantity_unit:
            measuredBy === MEASURED_BY_UNIT || !cur.quantity_unit
              ? undefined
              : (getUnitOptionMap() as Record<string, SelectOption>)[cur.quantity_unit] ?? {
                  label: cur.quantity_unit,
                  value: cur.quantity_unit,
                },
          sale_value: cur.sale_value,
        };
      })(),
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
  const system = useSelector(measurementSelector);
  const currency = useCurrencySymbol();
  const options = useSelector(cropVarietyOptionsSelector);
  const farmCropVarieties = useSelector(cropVarietiesSelector);

  const cropVarietyTileDataById: Record<number, CropVarietySaleTileData> = useMemo(
    () =>
      Object.fromEntries(
        (farmCropVarieties ?? []).map((cv) => [
          cv.crop_variety_id,
          {
            crop_variety_name: cv.crop_variety_name,
            crop_translation_key: cv.crop_translation_key,
            crop_variety_photo_url: cv.crop_variety_photo_url,
          },
        ]),
      ),
    [farmCropVarieties],
  );

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
      placeholder={t('SALE.ADD_SALE.SELECT_CROPS')}
      noOptionsMessage={getNoOptionsMessage('crop')}
    >
      {({ option, disabledInput }) => (
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
