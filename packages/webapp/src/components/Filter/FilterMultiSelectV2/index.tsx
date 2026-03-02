/*
 *  Copyright (c) 2024 LiteFarm.org
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

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import produce from 'immer';
import type { MultiValue } from 'react-select';
import { FilterItemProps } from '../FilterGroup';
import { Label } from '../../Typography';
import styles from './styles.module.scss';
import type { ComponentFilter, ComponentFilterOption } from '../types';
import {
  CheckboxMultiSelect,
  type SelectOption,
} from '../../Form/ReactSelect/CheckboxMultiSelect/';

interface FilterMultiSelectProps extends ComponentFilter {
  onChange?: FilterItemProps['onChange'];
  isDisabled?: boolean;
}

export const FilterMultiSelectV2 = ({
  subject,
  options,
  onChange,
  isDisabled,
  shouldReset,
}: FilterMultiSelectProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<ComponentFilterOption[]>(() =>
    options.filter((option) => option.default),
  );

  useEffect(() => {
    if (shouldReset) {
      setValue([]);
    }
  }, [shouldReset]);

  const defaultFilterState = useMemo(() => {
    return options.reduce(
      (defaultFilterState: Record<string, { active: boolean; label: string }>, option) => {
        defaultFilterState[option.value] = {
          active: false,
          label: option.label,
        };
        return defaultFilterState;
      },
      {},
    );
  }, []);

  const handleChange = (updatedValue: MultiValue<SelectOption>) => {
    setValue(
      [...updatedValue].sort((a, b) => a.label.localeCompare(b.label)) as ComponentFilterOption[],
    );
    onChange?.(
      produce(defaultFilterState, (defaultFilterState) => {
        for (const option of updatedValue) {
          defaultFilterState[option.value].active = true;
        }
      }),
    );
  };

  return (
    <div>
      <Label className={styles.label}>{subject}</Label>
      <CheckboxMultiSelect
        options={options}
        value={value}
        onChange={handleChange}
        isDisabled={isDisabled}
        placeholder={t('FILTER.SHOWING_ALL_DEFAULT')}
        showSelectionStatus={true}
      />
    </div>
  );
};
