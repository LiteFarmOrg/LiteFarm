/*
 *  Copyright 2025 LiteFarm.org
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

import { useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { Selector } from '@reduxjs/toolkit';
import { RootState } from '../../../store/store';
import styles from './styles.module.scss';
import FilterButton from '../../../components/Filter/FilterButton';
import Drawer from '../../../components/Drawer';
import Button from '../../../components/Form/Button';
import type { ReduxFilterEntity, FilterState } from '../types';

interface FilterDrawerContainerProps<T extends string> {
  isFilterActive: boolean;
  filterSelector: Selector<RootState, ReduxFilterEntity<T>>;
  setFilterAction: (filter: ReduxFilterEntity) => { type: string; payload: ReduxFilterEntity };
  initialFilter: ReduxFilterEntity<T>;
  drawerTitle: string;
  children: (props: {
    filter: ReduxFilterEntity<T>;
    onChange: (filterKey: string, filterState: FilterState) => void;
  }) => ReactNode;
}

const FilterDrawerContainer = <T extends string>({
  isFilterActive,
  filterSelector,
  setFilterAction,
  initialFilter,
  drawerTitle,
  children,
}: FilterDrawerContainerProps<T>) => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [tempFilter, setTempFilter] = useState<ReduxFilterEntity>(initialFilter);

  const filter = useSelector(filterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setFilterAction(tempFilter));
    setIsFilterOpen(false);
    setIsDirty(false);
  };

  const handleChange = (filterKey: string, filterState: FilterState) => {
    !isDirty && setIsDirty(true);
    setTempFilter({ ...tempFilter, [filterKey]: filterState });
  };

  useEffect(() => {
    setTempFilter(filter);
  }, [filter]);

  return (
    <div className={styles.filterButton}>
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      <Drawer
        isOpen={isFilterOpen}
        title={drawerTitle}
        onClose={() => setIsFilterOpen(false)}
        buttonGroup={
          <Button fullLength onClick={handleApply} color={'primary'} disabled={!isDirty}>
            {t('common:APPLY')}
          </Button>
        }
        classes={{
          drawerBackdrop: styles.drawerBackdrop,
        }}
      >
        {children({ filter, onChange: handleChange })}
      </Drawer>
    </div>
  );
};

export default FilterDrawerContainer;
