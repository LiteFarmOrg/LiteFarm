import React from 'react';
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

export default FilterGroup;
