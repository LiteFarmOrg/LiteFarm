import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FilterButton from '../../../components/Filter/FilterButton';
import {
  isFilterCurrentlyActiveSelector,
  setTransactionsFilter,
  transactionsFilterSelector,
} from '../../filterSlice';
import ModalComponent from '../../../components/Modals/ModalComponent/v2';
import TransactionFilterContent from '../../Filter/Transactions';
import Button from '../../../components/Form/Button';

const TransactionFilter = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const isFilterActive = useSelector(isFilterCurrentlyActiveSelector('transactions'));

  const transactionsFilter = useSelector(transactionsFilterSelector);
  const dispatch = useDispatch();

  const handleApply = () => {
    dispatch(setTransactionsFilter(filterRef.current));
    setIsFilterOpen(false);
  };

  const filterRef = useRef({});

  return (
    <>
      {/* TODO LF-3750 replace this with PureSearchBarAndFilter when search bar is responsive */}
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      {isFilterOpen && (
        <ModalComponent
          title={t('FINANCES.FILTER.TITLE')}
          dismissModal={() => setIsFilterOpen(false)}
          buttonGroup={
            <Button fullLength onClick={handleApply} color={'primary'} disabled={!isDirty}>
              {t('common:APPLY')}
            </Button>
          }
        >
          <TransactionFilterContent
            transactionsFilter={transactionsFilter}
            filterRef={filterRef}
            onChange={() => !isDirty && setIsDirty(true)}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default TransactionFilter;
