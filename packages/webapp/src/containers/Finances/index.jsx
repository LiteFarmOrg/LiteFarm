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

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import { getFarmExpenseType, getExpense, getSales, setSelectedExpenseTypes } from './actions';
import { calcOtherExpense, calcTotalLabour, calcActualRevenue } from './util';
import Moment from 'moment';
import DateRangeSelector from '../../components/Finances/DateRangeSelector';
import { extendMoment } from 'moment-range';
import { managementPlansSelector } from '../managementPlanSlice';
import { getManagementPlansAndTasks } from '../saga';
import { getRevenueTypes } from './saga';
import Button from '../../components/Form/Button';
import { Title } from '../../components/Typography';
import { useCurrencySymbol } from '../hooks/useCurrencySymbol';
import { taskEntitiesByManagementPlanIdSelector } from '../taskSlice';
import { isTaskType } from '../Task/useIsTaskType';
import { useTranslation } from 'react-i18next';
import { downloadFinanceReport } from './saga';
import FinancesCarrousel from '../../components/Finances/FinancesCarrousel';
import useDateRangeSelector from '../../components/DateRangeSelector/useDateRangeSelector';
import { SUNDAY } from '../../util/dateRange';
import TransactionFilter from './TransactionFilter';
import { transactionsFilterSelector } from '../filterSlice';
import useTransactions from './useTransactions';
import PureTransactionList from '../../components/Finances/Transaction/Mobile/List';
import PureCollapsibleSearch from '../../components/PopupFilter/PureCollapsibleSearch';
import useSearchFilter from '../hooks/useSearchFilter';
import NoSearchResults from '../../components/Card/NoSearchResults';
import AddTransactionButton from '../../components/Finances/AddTransactionButton';

const moment = extendMoment(Moment);

const Finances = ({ history }) => {
  const { t } = useTranslation();
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

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSales());
    dispatch(getExpense());
    dispatch(getFarmExpenseType());
    dispatch(getRevenueTypes());
    dispatch(getManagementPlansAndTasks());
    dispatch(setSelectedExpenseTypes([]));
  }, []);

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
    [transaction.note, transaction.typeLabel || t('SALE.FINANCES.LABOUR_EXPENSE')]
      .filter(Boolean)
      .join(' ');

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

  return (
    <div className={styles.financesContainer}>
      <Title style={{ marginBottom: '8px' }}>{t('SALE.FINANCES.TITLE')}</Title>
      <Button
        style={{ height: '48px', marginInline: '4px' }}
        onClick={() => {
          dispatch(
            downloadFinanceReport({
              revenue: totalRevenue,
              expenses: totalExpense,
              balance: (parseFloat(totalRevenue) - parseFloat(totalExpense)).toFixed(2),
            }),
          );
        }}
        color="success"
      >
        Download Report
      </Button>
      <hr />
      <div className={styles.filterBar} ref={overlayRef}>
        <DateRangeSelector className={styles.dateRangeSelector} />
        <div className={styles.filterBarButtons}>
          <PureCollapsibleSearch
            value={searchString}
            onChange={(e) => setSearchString(e.target.value)}
            isSearchActive={!!searchString}
            containerRef={overlayRef}
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
