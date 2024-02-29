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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Layout from '../Layout';
import PageTitle from '../PageTitle/v2';
import { Underlined } from '../Typography';
import { useTranslation } from 'react-i18next';
import Button from '../Form/Button';
import FilterGroup from '../Filter/FilterGroup';
import { ComponentFilter } from '../Filter/types';
import { ReduxFilterEntity } from '../../containers/Filter/types';

/*
PureFilterPage

This component receives the filters from the containers (other than transaction) and passes them to the FilterGroup component. The transactions filter uses a different a different approach where the outermost container holds the dirty state (as here the inner component does) and the inner container does the filter array transform (here done by the outer component!)

Data flow for all non-transaction filters is:

1. Filter Container (Filter/Task, Filter/CropVariety, Filter/Documents etc.)
2. PureFilterPage
3. FilterGroup

The container defines the filterRef and the relationship with the Redux store. The PureFilterPage component is a layout component that holds the title, the button group, and the reset button. FilterGroup displays the correct filters which each handle their own update of the Redux filter state via the filterRef.

In this flow the containers permutes Redux state into a ComponentFilter[] and pass that to this component

*/

// TODO: type the resetters
interface Resetter {
  setFunc: (val: any) => void;
  defaultVal: any;
}

interface PureFilterPageProps {
  filters: ComponentFilter[];
  filterRef: React.RefObject<ReduxFilterEntity>;
  title?: string;
  onApply: () => void;
  onGoBack?: () => void;
  children?: React.ReactNode;
  resetters?: Resetter[];
}

const PureFilterPage = ({
  title,
  filters,
  onApply,
  filterRef,
  onGoBack,
  children,
  resetters = [],
}: PureFilterPageProps) => {
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
      {title && <PageTitle title={title} onGoBack={onGoBack} />}
      <div style={{ margin: '24px 0' }}>
        <Underlined style={{ color: '#AA5F04' }} onClick={() => resetFilter()}>
          {t('FILTER.CLEAR_ALL_FILTERS')}
        </Underlined>
      </div>
      <FilterGroup
        filters={filters}
        filterRef={filterRef}
        onChange={setDirty}
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
  filterRef: PropTypes.object.isRequired,
  onGoBack: PropTypes.func,
  children: PropTypes.node,
  resetters: PropTypes.arrayOf(
    PropTypes.shape({
      setFunc: PropTypes.func.isRequired,
      defaultVal: PropTypes.any,
    }),
  ),
};
export default PureFilterPage;
