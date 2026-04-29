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

import { ComponentType, ReactNode, useEffect, useRef, useState } from 'react';
import { MultiValue } from 'react-select';
import {
  QUANTITY,
  QUANTITY_UNIT,
  SALE_VALUE,
} from '../../components/Forms/GeneralRevenue/constants';
import { CheckboxMultiSelect } from '../../components/Form/ReactSelect/CheckboxMultiSelect';
import type { SelectOption } from '../../components/Form/ReactSelect/CheckboxMultiSelect';
import { Error } from '../../components/Typography';
import styles from '../../components/Forms/GeneralRevenue/styles.module.scss';

export interface EntitySaleOption extends SelectOption {
  data?: unknown;
}

export interface EntitySaleItemProps {
  option: EntitySaleOption;
  system: string;
  currency: string;
  reactHookFormFunctions: Record<string, any>;
  fieldPrefix: string;
  disabledInput: boolean;
}

interface UseEntitySaleInputsParams {
  reactHookFormFunctions: Record<string, any>;
  currency: string;
  disabledInput: boolean;
  isActive: boolean;
  options: EntitySaleOption[];
  savedSalesById: Record<string | number, unknown> | null | undefined;
  fieldPrefix: string;
  entityIdFieldKey: string;
  ItemComponent: ComponentType<EntitySaleItemProps>;
  system: string;
  emptyMessage: string;
  placeholder?: string;
}

export default function useEntitySaleInputs({
  reactHookFormFunctions,
  currency,
  disabledInput,
  isActive,
  options,
  savedSalesById,
  fieldPrefix,
  entityIdFieldKey,
  ItemComponent,
  system,
  emptyMessage,
  placeholder,
}: UseEntitySaleInputsParams): ReactNode {
  const { register, unregister, getValues, setValue } = reactHookFormFunctions;

  const [selectedOptions, setSelectedOptions] = useState<EntitySaleOption[]>(() =>
    options.filter((opt) => savedSalesById?.[opt.value] !== undefined),
  );

  const prevSelectedOptionsRef = useRef(selectedOptions);

  // Re-register the top-level fieldPrefix field when isActive changes, updating its 'required' constraint
  useEffect(() => {
    const currentValue = getValues(fieldPrefix);
    unregister(fieldPrefix);
    register(fieldPrefix, { required: isActive });
    setValue(fieldPrefix, currentValue);
  }, [isActive]);

  // Unregister fields for options removed from the selection
  useEffect(() => {
    const prevOptions = prevSelectedOptionsRef.current;
    const currentValues = new Set(selectedOptions.map((o) => o.value));
    const removedOptions = prevOptions.filter((o) => !currentValues.has(o.value));

    removedOptions.forEach((o) => {
      unregister([
        `${fieldPrefix}.${o.value}.${entityIdFieldKey}`,
        `${fieldPrefix}.${o.value}.${QUANTITY}`,
        `${fieldPrefix}.${o.value}.${QUANTITY_UNIT}`,
        `${fieldPrefix}.${o.value}.${SALE_VALUE}`,
        `${fieldPrefix}.${o.value}`,
      ]);
    });

    prevSelectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);

  if (!isActive) {
    return null;
  }

  const handleChange = (newValue: MultiValue<SelectOption>) => {
    setSelectedOptions(newValue as EntitySaleOption[]);
  };

  return (
    <>
      <CheckboxMultiSelect
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        isDisabled={disabledInput}
        placeholder={placeholder}
      />
      {selectedOptions.length === 0 && (
        <Error style={{ marginBottom: '32px' }}>{emptyMessage}</Error>
      )}
      <hr className={styles.thinHr} />
      {selectedOptions.map((option) => (
        <ItemComponent
          key={option.value}
          option={option}
          system={system}
          currency={currency}
          reactHookFormFunctions={reactHookFormFunctions}
          fieldPrefix={fieldPrefix}
          disabledInput={disabledInput}
        />
      ))}
    </>
  );
}
