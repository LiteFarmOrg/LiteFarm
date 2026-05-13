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
import { useTranslation } from 'react-i18next';
import { ANIMAL_KEY, ANIMAL_SALE } from '../../../components/Forms/RevenueForm/constants';
import AnimalSaleItem from '../../../components/Forms/RevenueForm/AnimalSaleItem';
import EntitySaleEntries from '../../../components/Forms/RevenueForm/EntitySaleEntries';
import { useGetAnimalsQuery, useGetAnimalBatchesQuery } from '../../../store/api/apiSlice';
import { chooseIdentification } from '../../Animals/utils';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import { generateInventoryId } from '../../../util/animal';
import type { Animal, AnimalBatch } from '../../../store/api/types';
import { AnimalOrBatchKeys } from '../../Animals/types';
import type { SelectOption } from '../../../components/Form/ReactSelect/CheckboxMultiSelect';

interface AnimalSaleRecord {
  animal_id: number | null;
  animal_batch_id: number | null;
  quantity: number;
  quantity_unit: string | undefined;
  sale_value: number;
}

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
  const existingSales = sale?.animal_sale?.reduce<
    Record<string, Omit<AnimalSaleRecord, 'quantity_unit'> & { quantity_unit?: SelectOption }>
  >((acc, cur) => {
    const key = saleRecordToOptionKey(cur);
    acc[key] = {
      animal_id: cur.animal_id,
      animal_batch_id: cur.animal_batch_id,
      quantity: cur.quantity,
      quantity_unit: cur.quantity_unit
        ? ((getUnitOptionMap() as Record<string, SelectOption>)[cur.quantity_unit] ?? {
            label: cur.quantity_unit,
            value: cur.quantity_unit,
          })
        : undefined,
      sale_value: cur.sale_value,
    };
    return acc;
  }, {});
  return {
    [ANIMAL_SALE]: existingSales ?? undefined,
  };
};

export default function AnimalSaleInputs({ sale, disabledInput }: AnimalSaleInputsProps) {
  const { t } = useTranslation();
  const { data: animals } = useGetAnimalsQuery();
  const { data: animalBatches } = useGetAnimalBatchesQuery();

  const options = useMemo<SelectOption[]>(() => {
    const animalOptions = (animals ?? []).map((a: Animal) => ({
      label: chooseIdentification(a),
      value: generateInventoryId(AnimalOrBatchKeys.ANIMAL, a),
    }));

    const batchOptions = (animalBatches ?? []).map((b: AnimalBatch) => ({
      label: chooseIdentification(b),
      value: generateInventoryId(AnimalOrBatchKeys.BATCH, b),
    }));

    return [...animalOptions, ...batchOptions].sort((a, b) =>
      String(a.label).localeCompare(String(b.label)),
    );
  }, [animals, animalBatches]);

  const savedSalesById = sale?.animal_sale?.reduce<Record<string, AnimalSaleRecord>>(
    (acc, cur) => ({ ...acc, [saleRecordToOptionKey(cur)]: cur }),
    {},
  );

  return (
    <EntitySaleEntries
      disabledInput={disabledInput}
      options={options}
      savedSalesById={savedSalesById}
      fieldPrefix={ANIMAL_SALE}
      entityIdFieldKey={ANIMAL_KEY}
      placeholder={t('SALE.ADD_SALE.SELECT_ANIMALS')}
    >
      {({ option, system, currency, disabledInput }) => (
        <AnimalSaleItem
          key={option.value}
          animalName={String(option.label)}
          entityId={String(option.value)}
          system={system}
          currency={currency}
          fieldPrefix={ANIMAL_SALE}
          entityIdFieldKey={ANIMAL_KEY}
          disabledInput={disabledInput}
        />
      )}
    </EntitySaleEntries>
  );
}
