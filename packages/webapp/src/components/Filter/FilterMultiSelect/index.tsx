/*
 *  Copyright 2022-2024 LiteFarm.org
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
 *  GNU General Public License for more details, see <https://wwwl.gnu.org/licenses/>.
 */

import produce from 'immer';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from '../../Form/ReactSelect';
import { ComponentFilter, ComponentFilterOption } from '../types';
import { ReduxFilterEntity, FilterState } from '../../../containers/Filter/types';
import { ComponentOnChangeCallback } from '../FilterGroup';

interface FilterMultiSelectProps extends ComponentFilter {
  filterRef: React.RefObject<ReduxFilterEntity>;
  style?: React.CSSProperties;
  shouldReset?: number;
  onChange?: ComponentOnChangeCallback;
  className?: string;
}

export const FilterMultiSelect = ({
  subject,
  filterKey,
  style,
  filterRef,
  shouldReset,
  options = [],
  onChange,
  className,
}: FilterMultiSelectProps) => {
  const { t } = useTranslation(['common']);

  const defaultValue = useMemo(() => {
    return options.filter((option) => option.default);
  }, []);
  const [value, setValue] = useState(defaultValue);

  const defaultFilterState = useMemo(() => {
    return options.reduce((defaultFilterState: FilterState, option) => {
      defaultFilterState[option.value] = {
        active: false,
        label: option.label,
      };
      return defaultFilterState;
    }, {});
  }, []);

  useEffect(() => {
    if (shouldReset) {
      setValue([]);
    }
  }, [shouldReset]);

  useEffect(() => {
    filterRef.current![filterKey] = produce(defaultFilterState, (defaultFilterState) => {
      for (const option of value) {
        defaultFilterState[option.value].active = true;
      }
    });
  }, [value]);

  return (
    <ReactSelect
      //@ts-ignore
      style={style} // I suspect the forwardRef is at fault for the type error?
      placeholder={`${t('common:SELECT')}...`}
      options={options}
      label={subject}
      value={value}
      onChange={(value: ComponentFilterOption[]): void => {
        setValue(value);
        onChange?.(value as unknown as FilterState);
        /* NOTE: What is being passed here is in ComponentFilterOption format, and would not work if the state-setting onChange had been passed. However, the finance report filters -- the only container using a state-setting onChange -- don't use multi-select filters. */
      }}
      isMulti
      isSearchable
      className={className}
    />
  );
};

FilterMultiSelect.propTypes = {
  subject: PropTypes.string,
  options: PropTypes.array,
  filterKey: PropTypes.string,
  shouldReset: PropTypes.number,
  className: PropTypes.string,
};
