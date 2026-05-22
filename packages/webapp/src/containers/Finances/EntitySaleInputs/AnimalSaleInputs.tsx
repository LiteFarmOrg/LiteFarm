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

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { ANIMAL_INVENTORY_ID, ANIMAL_SALE } from '../../../components/Forms/RevenueForm/constants';
import AnimalSaleItem from '../../../components/Forms/RevenueForm/AnimalSaleItem';
import EntitySalePicker from '../../../components/Forms/RevenueForm/EntitySalePicker';
import { measurementSelector } from '../../userFarmSlice';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import { animalOptionsSelector } from '../../../store/selectors/animals';
import { AnimalOrBatchKeys } from '../../Animals/types';
import type { SelectOption } from '../../../components/Form/ReactSelect/CheckboxMultiSelect';
import { getNoOptionsMessage } from '../util';

interface BaseAnimalSaleRecord<TQuantityUnit> {
  animal_id: number | null;
  animal_batch_id: number | null;
  quantity: number;
  quantity_unit: TQuantityUnit;
  sale_value: number;
}

// API data returns a string for quantity_unit, but form data uses SelectOption
type AnimalSaleRecord = BaseAnimalSaleRecord<string | undefined>;
type AnimalSaleDefaultRecord = BaseAnimalSaleRecord<SelectOption | undefined>;

export interface AnimalSale {
  animal_sale?: AnimalSaleRecord[];
}

interface AnimalSaleInputsProps {
  sale?: AnimalSale;
  disabledInput: boolean;
}

const saleRecordToOptionKey = (record: AnimalSaleRecord) => {
  const isAnimal = record.animal_id !== null;
  const key = isAnimal ? AnimalOrBatchKeys.ANIMAL : AnimalOrBatchKeys.BATCH;
  const id = isAnimal ? record.animal_id : record.animal_batch_id;

  return `${key}_${id}`;
};

export const getAnimalSaleDefaultValues = (sale: AnimalSale | undefined) => {
  if (!sale?.animal_sale) {
    return { [ANIMAL_SALE]: undefined };
  }

  const unitMap = getUnitOptionMap() as Record<string, SelectOption>;

  const existingSales = Object.fromEntries(
    sale.animal_sale.map((record) => {
      const key = saleRecordToOptionKey(record);
      const unit = record.quantity_unit;
      const formattedEntry: AnimalSaleDefaultRecord = {
        ...record,
        quantity_unit: unit ? (unitMap[unit] ?? { label: unit, value: unit }) : undefined,
      };
      return [key, formattedEntry];
    }),
  );

  return {
    [ANIMAL_SALE]: existingSales,
  };
};

export default function AnimalSaleInputs({ sale, disabledInput }: AnimalSaleInputsProps) {
  const { t } = useTranslation();
  const system = useSelector(measurementSelector);
  const currency = useCurrencySymbol();
  const options = useSelector(animalOptionsSelector);

  const savedSalesById = sale?.animal_sale?.reduce<Record<string, AnimalSaleRecord>>(
    (acc, cur) => ({ ...acc, [saleRecordToOptionKey(cur)]: cur }),
    {},
  );

  return (
    <EntitySalePicker
      disabledInput={disabledInput}
      options={options}
      savedSalesById={savedSalesById}
      fieldPrefix={ANIMAL_SALE}
      entityIdFieldKey={ANIMAL_INVENTORY_ID}
      label={t('FINANCES.TRANSACTION.ANIMALS')}
      placeholder={t('TASK.SELECT_ANIMALS')}
      noOptionsMessage={getNoOptionsMessage('animal')}
    >
      {({ option, disabledInput }) => (
        <AnimalSaleItem
          key={option.value}
          animalName={String(option.label)}
          entityId={String(option.value)}
          system={system}
          currency={currency}
          fieldPrefix={ANIMAL_SALE}
          entityIdFieldKey={ANIMAL_INVENTORY_ID}
          disabledInput={disabledInput}
        />
      )}
    </EntitySalePicker>
  );
}
