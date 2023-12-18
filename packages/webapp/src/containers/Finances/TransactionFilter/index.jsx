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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Drawer from '../../../components/Drawer';
import FilterButton from '../../../components/Filter/FilterButton';
import Button from '../../../components/Form/Button';
import { Semibold } from '../../../components/Typography';
import TransactionFilterContent from '../../Filter/Transactions';
import {
  isFilterCurrentlyActiveSelector,
  setTransactionsFilter,
  transactionsFilterSelector,
} from '../../filterSlice';
import styles from './styles.module.scss';

const TransactionFilter = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isFilterActive = useSelector(isFilterCurrentlyActiveSelector('transactions', true));

  const transactionsFilter = useSelector(transactionsFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setTransactionsFilter(filterRef.current));
    setIsFilterOpen(false);
  };

  const filterRef = useRef({});

  return (
    <div>
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      <Drawer
        isOpen={isFilterOpen}
        title={t('FINANCES.FILTER.TITLE')}
        onClose={() => setIsFilterOpen(false)}
        buttonGroup={
          <Button fullLength onClick={handleApply} color={'primary'} disabled={!isDirty}>
            {t('common:APPLY')}
          </Button>
        }
      >
        <>
          <Semibold className={styles.helpText}>{t('FINANCES.FILTER.HELP_TEXT')}</Semibold>
          <TransactionFilterContent
            transactionsFilter={transactionsFilter}
            filterRef={filterRef}
            onChange={() => !isDirty && setIsDirty(true)}
          />
        </>
      </Drawer>
    </div>
  );
};

export default TransactionFilter;
