/*
 *  Copyright 2023 LiteFarm.org
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

import PropTypes from 'prop-types';
import FilterPillSelect from '../FilterPillSelect';
import { DATE, DATE_RANGE, PILL_SELECT, SEARCHABLE_MULTI_SELECT } from '../filterTypes';
import { FilterDateRange } from '../FilterDateRange';
import { FilterMultiSelect } from '../FilterMultiSelect';
import { FilterDate } from '../FilterDate';
import styles from './styles.module.scss';

const FilterGroup = ({ filters, filterRef, onChange, shouldReset }) => {
  return filters.map((filter) => {
    if ((filter.type === PILL_SELECT || !filter.type) && filter.options.length > 0) {
      return (
        <FilterPillSelect
          subject={filter.subject}
          options={filter.options}
          filterKey={filter.filterKey}
          className={styles.filter}
          filterRef={filterRef}
          key={filter.filterKey}
          shouldReset={shouldReset}
          onChange={onChange}
        />
      );
    } else if (filter.type === DATE_RANGE) {
      return (
        <FilterDateRange
          key={filter.subject}
          filterRef={filterRef}
          className={styles.filter}
          shouldReset={shouldReset}
          onChange={onChange}
          {...filter}
        />
      );
    } else if (filter.type === SEARCHABLE_MULTI_SELECT) {
      return (
        <FilterMultiSelect
          subject={filter.subject}
          options={filter.options}
          filterKey={filter.filterKey}
          className={styles.filter}
          filterRef={filterRef}
          key={filter.filterKey}
          shouldReset={shouldReset}
          onChange={onChange}
        />
      );
    } else if (filter.type === DATE) {
      return <FilterDate {...filter} key={filter.subject} filterRef={filterRef} />;
    }
  });
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
  filterRef: PropTypes.shape({
    current: PropTypes.shape({ active: PropTypes.bool, label: PropTypes.string }),
  }).isRequired,
  onChange: PropTypes.func,
  shouldReset: PropTypes.bool,
};

export default FilterGroup;
