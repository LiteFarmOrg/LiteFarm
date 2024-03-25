/*
 *  Copyright 2023, 2024 LiteFarm.org
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

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { FilterDate } from '../FilterDate';
import { FilterDateRange } from '../FilterDateRange';
import styles from './styles.module.scss';
import type { ContainerOnChangeCallback, FilterState } from '../../../containers/Filter/types';
import { FilterType, type ComponentFilter } from '../types';
import { FilterMultiSelect } from '../FilterMultiSelect';

type ComponentOnChangeCallback = (filterState: FilterState) => void;

export interface FilterItemProps {
  filter: ComponentFilter;
  onChange: ComponentOnChangeCallback;
  shouldReset?: number;
  showIndividualFilterControls?: boolean;
}

const FilterItem = ({ filter, showIndividualFilterControls, ...props }: FilterItemProps) => {
  if (filter.type === FilterType.DATE_RANGE) {
    return <FilterDateRange key={filter.subject} {...filter} {...props} />;
  } else if (filter.type === FilterType.SEARCHABLE_MULTI_SELECT) {
    return (
      <FilterMultiSelect
        subject={filter.subject}
        options={filter.options}
        filterKey={filter.filterKey}
        key={filter.filterKey}
        {...props}
      />
    );
  } else if (filter.type === FilterType.DATE) {
    return <FilterDate {...filter} key={filter.subject} {...props} />;
  } else {
    return null;
  }
};

interface FilterGroupProps {
  filters: ComponentFilter[];
  onChange: ContainerOnChangeCallback;
  filterContainerClassName?: string;
  shouldReset?: number;
  showIndividualFilterControls?: boolean;
}

const FilterGroup = ({
  filters,
  filterContainerClassName,
  onChange,
  shouldReset,
  showIndividualFilterControls = false,
}: FilterGroupProps) => {
  return (
    <>
      {filters.map((filter) => {
        return (
          <div
            key={filter.filterKey ?? filter.subject}
            className={clsx(styles.filterContainer, filterContainerClassName)}
          >
            <FilterItem
              filter={filter}
              onChange={(filterState) => onChange(filter.filterKey, filterState)}
              shouldReset={shouldReset}
              showIndividualFilterControls={showIndividualFilterControls}
            />
          </div>
        );
      })}
    </>
  );
};

FilterGroup.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      subject: PropTypes.string,
      filterKey: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          default: PropTypes.bool,
          label: PropTypes.string.isRequired,
        }),
      ),
    }),
  ).isRequired,
  filterContainerClassName: PropTypes.string,
  onChange: PropTypes.func,
  shouldReset: PropTypes.number,
  showIndividualFilterControls: PropTypes.bool,
};

FilterGroup.defaultProps = {
  showIndividualFilterControls: false,
};

export default FilterGroup;
