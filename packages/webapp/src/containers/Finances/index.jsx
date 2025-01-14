/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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

import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import NoSearchResults from '../../components/Card/NoSearchResults';
import useDateRangeSelector from '../../components/DateRangeSelector/useDateRangeSelector';
import AddTransactionButton from '../../components/Finances/AddTransactionButton';
import DateRangeSelector from '../../components/Finances/DateRangeSelector';
import FinancesCarrousel from '../../components/Finances/FinancesCarrousel';
import PureTransactionList from '../../components/Finances/Transaction/Mobile/List';
import PureCollapsingSearch from '../../components/PopupFilter/PureCollapsingSearch';
import Spinner from '../../components/Spinner';
import { Title } from '../../components/Typography';
import { SUNDAY } from '../../util/dateRange';
import { isTaskType } from '../Task/useIsTaskType';
import { transactionsFilterSelector } from '../filterSlice';
import { useCurrencySymbol } from '../hooks/useCurrencySymbol';
import useSearchFilter from '../hooks/useSearchFilter';
import { managementPlansSelector } from '../managementPlanSlice';
import { taskEntitiesByManagementPlanIdSelector } from '../taskSlice';
import Report from './Report';
import TransactionFilter from './TransactionFilter';
import { setIsFetchingData } from './actions';
import { fetchAllData } from './saga';
import { isFetchingDataSelector } from './selectors';
import styles from './styles.module.scss';
import useTransactions from './useTransactions';
import { calcActualRevenue, calcOtherExpense, calcTotalLabour } from './util';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';

const moment = extendMoment(Moment);

const Finances = ({ history }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const managementPlans = useSelector(managementPlansSelector);
  const { EXPENSE_TYPE: expenseTypeFilter, REVENUE_TYPE: revenueTypeFilter } = useSelector(
    transactionsFilterSelector,
  );
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);
  const { startDate, endDate } = useDateRangeSelector({ weekStartDate: SUNDAY });
  const dateFilter = { startDate, endDate };
  const transactions = useTransactions({ dateFilter, expenseTypeFilter, revenueTypeFilter });
  const currencySymbol = useCurrencySymbol();
  const overlayRef = useRef(null);
  const isFetchingData = useSelector(isFetchingDataSelector);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllData());
  }, [fetchAllData]);

  useEffect(() => {
    if (!isFetchingData) {
      setIsLoading(false);
    }
  }, [isFetchingData]);

  const getEstimatedRevenue = (managementPlans) => {
    let totalRevenue = 0;
    if (managementPlans) {
      managementPlans
        .filter(({ abandon_date }) => !abandon_date)
        .forEach((plan) => {
          // check if this plan has a harvest task projected within the time frame
          const harvestTasks =
            tasksByManagementPlanId[plan.management_plan_id]?.filter((task) =>
              isTaskType(task.taskType, 'HARVEST_TASK'),
            ) || [];
          const harvestDates = harvestTasks?.map((task) =>
            moment(task.due_date).utc().format('YYYY-MM-DD'),
          );

          if (
            harvestDates.some(
              (harvestDate) =>
                moment(startDate).startOf('day').utc().isSameOrBefore(harvestDate, 'day') &&
                moment(endDate).utc().isSameOrAfter(harvestDate, 'day'),
            )
          ) {
            totalRevenue += plan.estimated_revenue;
          }
        });
    }
    return parseFloat(totalRevenue).toFixed(0);
  };

  const makeTransactionsSearchableString = (transaction) =>
    [transaction.note, transaction.typeLabel].filter(Boolean).join(' ');

  const [filteredTransactions, searchString, setSearchString] = useSearchFilter(
    transactions,
    makeTransactionsSearchableString,
  );
  const hasSearchResults = filteredTransactions.length !== 0;

  const totalRevenue = calcActualRevenue(filteredTransactions).toFixed(0);
  const estimatedRevenue = getEstimatedRevenue(managementPlans);
  const labourExpense = calcTotalLabour(filteredTransactions).toFixed(0);
  const otherExpense = calcOtherExpense(filteredTransactions).toFixed(0);
  const totalExpense = (parseFloat(otherExpense) + parseFloat(labourExpense)).toFixed(0);

  return isLoading ? (
    <Spinner />
  ) : (
    <div className={styles.financesContainer}>
      <div className={styles.titleContainer}>
        <Title>{t('SALE.FINANCES.TITLE')}</Title>
        <Report />
      </div>
      <div className={styles.filterBar} ref={overlayRef}>
        <DateRangeSelector className={styles.dateRangeSelector} />
        <div className={styles.filterBarButtons}>
          <PureCollapsingSearch
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            isSearchActive={!!searchString}
            containerRef={overlayRef}
            isDesktop={isDesktop}
          />
          <TransactionFilter />
        </div>
      </div>
      <div className={styles.carrouselContainer}>
        <FinancesCarrousel
          totalExpense={totalExpense}
          totalRevenue={totalRevenue}
          labourExpense={labourExpense}
          otherExpense={otherExpense}
          estimatedRevenue={estimatedRevenue}
          currencySymbol={currencySymbol}
          history={history}
        />
        <AddTransactionButton />
      </div>
      {hasSearchResults ? (
        <PureTransactionList data={filteredTransactions} mobileView={true} />
      ) : (
        <NoSearchResults
          className={styles.noResultsCard}
          searchTerm={searchString}
          includeFiltersInClearSuggestion
        />
      )}
    </div>
  );
};

export default Finances;
