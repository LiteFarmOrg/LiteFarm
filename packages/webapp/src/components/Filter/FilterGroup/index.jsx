import React from 'react';
import PropTypes from 'prop-types';
import FilterPillSelect from '../FilterPillSelect';
import { DATE, DATE_RANGE, PILL_SELECT, SEARCHABLE_MULTI_SELECT } from '../filterTypes';
import { FilterDateRange } from '../FilterDateRange';
import { FilterMultiSelect } from '../FilterMultiSelect';
import { FilterDate } from '../FilterDate';

const FilterGroup = ({ filters, filterRef }) => {
  return filters.map((filter) => {
    if ((filter.type === PILL_SELECT || !filter.type) && filter.options.length > 0) {
      return (
        <FilterPillSelect
          subject={filter.subject}
          options={filter.options}
          filterKey={filter.filterKey}
          style={{ marginBottom: '32px' }}
          filterRef={filterRef}
          key={filter.filterKey}
        />
      );
    } else if (filter.type === DATE_RANGE) {
      return (
        <FilterDateRange
          key={filter.subject}
          filterRef={filterRef}
          style={{ marginBottom: '32px' }}
          {...filter}
        />
      );
    } else if (filter.type === SEARCHABLE_MULTI_SELECT) {
      return (
        <FilterMultiSelect
          subject={filter.subject}
          options={filter.options}
          filterKey={filter.filterKey}
          style={{ marginBottom: '32px' }}
          filterRef={filterRef}
          key={filter.filterKey}
        />
      );
    } else if (filter.type === DATE) {
      return <FilterDate {...filter} key={filter.subject} filterRef={filterRef} />;
    }
  });
};

FilterGroup.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  onGoBack: PropTypes.func,
  hasDateRangeFilter: PropTypes.bool,
};

export default FilterGroup;
