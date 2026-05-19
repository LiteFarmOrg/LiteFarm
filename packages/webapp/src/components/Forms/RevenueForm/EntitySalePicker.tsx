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
import { QUANTITY, QUANTITY_UNIT, SALE_VALUE } from './constants';
import { CheckboxMultiSelect } from '../../Form/ReactSelect/CheckboxMultiSelect';
import type { SelectOption } from '../../Form/ReactSelect/CheckboxMultiSelect';
import { Error } from '../../Typography';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import styles from './styles.module.scss';

export interface EntitySaleItemProps {
  option: SelectOption;
  fieldPrefix: string;
  disabledInput: boolean;
}

interface EntitySalePickerProps {
  disabledInput: boolean;
  options: SelectOption[];
  savedSalesById: Record<string | number, unknown> | null | undefined;
  fieldPrefix: string;
  entityIdFieldKey: string;
  label: string;
  placeholder?: string;
  children: (props: EntitySaleItemProps) => ReactNode;
}

export default function EntitySalePicker({
  disabledInput,
  options,
  savedSalesById,
  fieldPrefix,
  entityIdFieldKey,
  label,
  placeholder,
  children,
}: EntitySalePickerProps): ReactNode {
  const { t } = useTranslation();
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
    <div className={styles.entitySalePickerContainer}>
      <div className={styles.selectorGroup}>
        <InputBaseLabel label={label} />
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
            fieldPrefix,
            disabledInput,
          }),
        )}
      </div>
    </div>
  );
}
