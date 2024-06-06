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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import { Underlined } from '../Typography';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import FilterGroup from '../Filter/FilterGroup';
import type { ComponentFilter } from '../Filter/types';
import type { ReduxFilterEntity } from '../../containers/Filter/types';

interface PureFilterPageProps {
  filters: ComponentFilter[];
  title?: string;
  onApply: () => void /* The handler for Redux state update in this flow, e.g.
    () => dispatch(setCropCatalogueFilter(tempFilter)) */;
  tempFilter: ReduxFilterEntity;
  setTempFilter: (filter: ReduxFilterEntity) => void;
  onGoBack?: () => void;
  children?: React.ReactNode;
}

const PureFilterPage = ({
  title,
  filters,
  onApply,
  tempFilter,
  setTempFilter,
  onGoBack,
  children,
}: PureFilterPageProps) => {
  const { t } = useTranslation();

  const [shouldReset, setShouldReset] = useState(0);
  const triggerReset = () => setShouldReset((shouldReset) => shouldReset + 1);

  const resetFilter = () => {
    triggerReset();
    setIsDirty(true);
    setTempFilter(
      (() => {
        const result: { [key: string]: { [key: string]: { active: boolean; label: string } } } = {};

        filters.forEach((item) => {
          result[item.filterKey] = {};
          if (item.options && item.options.length > 0) {
            item.options.forEach((option) => {
              result[item.filterKey][option.value] = {
                active: false,
                label: option.label,
              };
            });
          }
        });
        result['FROM_DATE'] = {};
        result['TO_DATE'] = {};
        return result;
      })(),
    );
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
      {title && <PageTitle title={title} onGoBack={onGoBack} />}
      <div style={{ margin: '24px 0' }}>
        <Underlined style={{ color: '#AA5F04' }} onClick={() => resetFilter()}>
          {t('FILTER.CLEAR_ALL_FILTERS')}
        </Underlined>
      </div>
      <FilterGroup
        filters={filters}
        onChange={(filterKey, filterState) => {
          if (filterKey === 'DATE_RANGE') {
            setTempFilter({
              ...tempFilter,
              ...(filterState.fromDate && { FROM_DATE: filterState.fromDate }),
              ...(filterState.toDate && { TO_DATE: filterState.toDate }),
            });
          } else {
            setTempFilter({
              ...tempFilter,
              [filterKey]: filterState,
            });
          }
          setDirty();
        }}
        shouldReset={shouldReset}
      />
      {children}
    </Layout>
  );
};

PureFilterPage.propTypes = {
  title: PropTypes.string,
  filters: PropTypes.array.isRequired,
  onApply: PropTypes.func.isRequired,
  onGoBack: PropTypes.func,
  tempFilter: PropTypes.object,
  setTempFilter: PropTypes.func,
  children: PropTypes.node,
};
export default PureFilterPage;
