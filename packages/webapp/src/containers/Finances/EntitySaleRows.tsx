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

import { ReactNode, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MultiValue } from 'react-select';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../userFarmSlice';
import {
  QUANTITY,
  QUANTITY_UNIT,
  SALE_VALUE,
} from '../../components/Forms/GeneralRevenue/constants';
import { CheckboxMultiSelect } from '../../components/Form/ReactSelect/CheckboxMultiSelect';
import type { SelectOption } from '../../components/Form/ReactSelect/CheckboxMultiSelect';
import { Error } from '../../components/Typography';
import styles from '../../components/Forms/GeneralRevenue/styles.module.scss';
import { useCurrencySymbol } from '../hooks/useCurrencySymbol';

export interface EntitySaleItemProps {
  option: SelectOption;
  system: string;
  currency: string;
  fieldPrefix: string;
  disabledInput: boolean;
}

interface EntitySaleRowsProps {
  disabledInput: boolean;
  options: SelectOption[];
  savedSalesById: Record<string | number, unknown> | null | undefined;
  fieldPrefix: string;
  entityIdFieldKey: string;
  placeholder?: string;
  children: (props: EntitySaleItemProps) => ReactNode;
}

export default function EntitySaleRows({
  disabledInput,
  options,
  savedSalesById,
  fieldPrefix,
  entityIdFieldKey,
  placeholder,
  children,
}: EntitySaleRowsProps): ReactNode {
  const { t } = useTranslation();
  const system = useSelector(measurementSelector);
  const currency = useCurrencySymbol();
  const { register, unregister, getValues, setValue } = useFormContext();

  const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>(() =>
    options.filter((opt) => savedSalesById?.[opt.value] !== undefined),
  );
  const [isSelectionValid, setIsSelectionValid] = useState(true);

  useEffect(() => {
    const currentValue = getValues(fieldPrefix);
    unregister(fieldPrefix);
    register(fieldPrefix, { required: true });
    setValue(fieldPrefix, currentValue);
  }, []);

  const handleChange = (newValue: MultiValue<SelectOption>) => {
    const newOptions = [...newValue];
    const nextValues = new Set(newOptions.map((o) => o.value));
    const removedOptions = selectedOptions.filter((o) => !nextValues.has(o.value));

    removedOptions.forEach((o) => {
      unregister([
        `${fieldPrefix}.${o.value}.${entityIdFieldKey}`,
        `${fieldPrefix}.${o.value}.${QUANTITY}`,
        `${fieldPrefix}.${o.value}.${QUANTITY_UNIT}`,
        `${fieldPrefix}.${o.value}.${SALE_VALUE}`,
        `${fieldPrefix}.${o.value}`,
      ]);
    });

    setSelectedOptions(newOptions);
    setIsSelectionValid(newOptions.length > 0);
  };

  return (
    <div className={styles.entitySaleRows}>
      <div className={styles.selectorGroup}>
        <CheckboxMultiSelect
          options={options}
          value={selectedOptions}
          onChange={handleChange}
          isDisabled={disabledInput}
          placeholder={placeholder}
        />
        {!isSelectionValid && <Error>{t('common:REQUIRED')}</Error>}
      </div>
      <div className={styles.saleItemList}>
        {selectedOptions.map((option) =>
          children({
            option,
            system,
            currency,
            fieldPrefix,
            disabledInput,
          }),
        )}
      </div>
    </div>
  );
}
