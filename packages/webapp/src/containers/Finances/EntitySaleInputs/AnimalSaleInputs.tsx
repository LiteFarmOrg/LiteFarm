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
import type { Animal, AnimalBatch } from '../../../store/api/types';
import type { SelectOption } from '../../../components/Form/ReactSelect/CheckboxMultiSelect';

interface AnimalSaleRecord {
  animal_id: number | null;
  animal_batch_id: number | null;
  quantity: number;
  quantity_unit: string | undefined;
  sale_value: number;
}

interface AnimalSale {
  animal_sale?: AnimalSaleRecord[];
}

interface AnimalSaleInputsProps {
  sale?: AnimalSale;
  disabledInput: boolean;
}

const animalOptionKey = (id: number) => `animal_${id}`;
const batchOptionKey = (id: number) => `batch_${id}`;

const saleRecordToOptionKey = (record: AnimalSaleRecord) =>
  record.animal_id != null
    ? animalOptionKey(record.animal_id)
    : batchOptionKey(record.animal_batch_id as number);

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
    const list: SelectOption[] = [];
    (animals ?? []).forEach((a: Animal) => {
      list.push({ label: chooseIdentification(a), value: animalOptionKey(a.id) });
    });
    (animalBatches ?? []).forEach((b: AnimalBatch) => {
      list.push({ label: chooseIdentification(b), value: batchOptionKey(b.id) });
    });
    list.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    return list;
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
      placeholder={t('SALE.ADD_SALE.ANIMAL')}
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
