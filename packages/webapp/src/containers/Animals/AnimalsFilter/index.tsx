/*
 *  Copyright 2024 LiteFarm.org
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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Drawer from '../../../components/Drawer';
import FilterButton from '../../../components/Filter/FilterButton';
import Button from '../../../components/Form/Button';
import AnimalsFilterContent from '../../Filter/Animals/';
import { ReduxFilterEntity } from '../../Filter/types';
import { AnimalsFilterKeys } from '../../Filter/Animals/types';
import { setAnimalsFilter, animalsFilterSelector, initialAnimalsFilter } from '../../filterSlice';

const AnimalsFilter = ({ isFilterActive }: { isFilterActive: boolean }) => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [tempAnimalsFilter, setTempAnimalsFilter] =
    useState<ReduxFilterEntity<AnimalsFilterKeys>>(initialAnimalsFilter);

  const animalsFilter = useSelector(animalsFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setAnimalsFilter(tempAnimalsFilter));
    setIsFilterOpen(false);
    setIsDirty(false);
  };

  return (
    <div className={styles.filterButton}>
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      <Drawer
        isOpen={isFilterOpen}
        title={t('ANIMAL.FILTER.TITLE')}
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
        <AnimalsFilterContent
          animalsFilter={animalsFilter}
          onChange={(filterKey, filterState) => {
            !isDirty && setIsDirty(true);
            setTempAnimalsFilter({ ...tempAnimalsFilter, [filterKey as string]: filterState });
          }}
        />
      </Drawer>
    </div>
  );
};

export default AnimalsFilter;
