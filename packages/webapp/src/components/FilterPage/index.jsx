import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import { Underlined } from '../Typography';
import { useTranslation } from 'react-i18next';
import FilterPillSelect from '../Filter/FilterPillSelect';
import Button from '../Form/Button';
import { DATE, DATE_RANGE, PILL_SELECT, SEARCHABLE_MULTI_SELECT } from '../Filter/filterTypes';
import { FilterDateRange } from '../Filter/FilterDateRange';
import { FilterMultiSelect } from '../Filter/FilterMultiSelect';
import { FilterDate } from '../Filter/FilterDate';

const PureFilterPage = ({
  title,
  filters,
  onApply,
  filterRef,
  onGoBack,
  children,
  resetters = [],
}) => {
  const { t } = useTranslation();

  const [shouldReset, setShouldReset] = useState(0);
  const triggerReset = () => setShouldReset((shouldReset) => shouldReset + 1);

  const resetFilter = () => {
    triggerReset();
    for (const resetter of resetters) {
      const { setFunc, defaultVal } = resetter;
      setFunc(defaultVal);
    }
    setIsDirty(true);
  };

  const [isDirty, setIsDirty] = useState(false);
  const setDirty = () => !isDirty && setIsDirty(true);

  return (
    <Layout
      buttonGroup={
        <Button disabled={!isDirty} onClick={onApply} fullLength>
          {t('common:APPLY')}
        </Button>
      }
    >
      <PageTitle title={title} onGoBack={onGoBack} />

      <div style={{ margin: '24px 0' }}>
        <Underlined style={{ color: '#AA5F04' }} onClick={() => resetFilter()}>
          {t('FILTER.CLEAR_ALL_FILTERS')}
        </Underlined>
      </div>

      {filters.map((filter) => {
        if ((filter.type === PILL_SELECT || !filter.type) && filter.options.length > 0) {
          return (
            <FilterPillSelect
              subject={filter.subject}
              options={filter.options}
              filterKey={filter.filterKey}
              style={{ marginBottom: '32px' }}
              filterRef={filterRef}
              key={filter.filterKey}
              shouldReset={shouldReset}
              onChange={setDirty}
            />
          );
        } else if (filter.type === DATE_RANGE) {
          return (
            <FilterDateRange
              setDirty={setDirty}
              key={filter.subject}
              filterRef={filterRef}
              shouldReset={shouldReset}
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
              shouldReset={shouldReset}
              onChange={setDirty}
            />
          );
        } else if (filter.type === DATE) {
          return (
            <FilterDate
              {...filter}
              onChange={setDirty}
              key={filter.subject}
              filterRef={filterRef}
              shouldReset={shouldReset}
            />
          );
        }
      })}
      {children}
    </Layout>
  );
};

PureFilterPage.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  onGoBack: PropTypes.func,
  hasDateRangeFilter: PropTypes.bool,
};

export default PureFilterPage;

// // TRUST THE NATURAL RECURSION
// const recursiveFilterReset = (filter) => {
//   Object.keys(filter).forEach((key) => {
//     const value = filter[key];
//     if (typeof value === 'boolean') {
//       filter[key] = false;
//     } else {
//       filter[key] = recursiveFilterReset(value);
//     }
//   });
//   return filter;
// };
