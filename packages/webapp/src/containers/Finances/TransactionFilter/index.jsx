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
import TransactionsFilterContent from '../../Filter/Transactions';
import Button from '../../../components/Form/Button';

const TransactionFilter = () => {
  const { t } = useTranslation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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
      <FilterButton onClick={() => setIsFilterOpen(true)} isFilterActive={isFilterActive} />
      {isFilterOpen && (
        <ModalComponent
          title={t('FINANCES.FILTER.TITLE')}
          dismissModal={() => setIsFilterOpen(false)}
          buttonGroup={
            <Button fullLength onClick={handleApply} color={'primary'}>
              {t('common:APPLY')}
            </Button>
          }
        >
          <TransactionsFilterContent
            transactionsFilter={transactionsFilter}
            filterRef={filterRef}
          />
        </ModalComponent>
      )}
    </>
  );
};

export default TransactionFilter;
