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

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import Drawer from '../../../components/Drawer';
import FilterButton from '../../../components/Filter/FilterButton';
import Button from '../../../components/Form/Button';
import AnimalsFilterContent from '../../Filter/Animals/';
import {
  isFilterCurrentlyActiveSelector,
  setAnimalsFilter,
  animalsFilterSelector,
  initialAnimalsFilter,
} from '../../filterSlice';

const AnimalsFilter = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isFilterActive = useSelector(isFilterCurrentlyActiveSelector('animals'));

  const animalsFilter = useSelector(animalsFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setAnimalsFilter(filterRef.current));
    setIsFilterOpen(false);
  };

  const filterRef = useRef({ ...initialAnimalsFilter });

  return (
    <div className={styles.filterButton}>
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      <Drawer
        isOpen={isFilterOpen}
        title={t('ANIMALS.FILTER.TITLE')}
        onClose={() => setIsFilterOpen(false)}
        buttonGroup={
          <Button fullLength onClick={handleApply} color={'primary'} disabled={!isDirty}>
            {t('common:APPLY')}
          </Button>
        }
        classes={{ backdrop: styles.modalBackdrop, content: styles.modalContent }}
      >
        <AnimalsFilterContent
          animalsFilter={animalsFilter}
          filterRef={filterRef}
          onChange={() => !isDirty && setIsDirty(true)}
        />
      </Drawer>
    </div>
  );
};

export default AnimalsFilter;
