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

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import history from '../../history';
import { expenseSelector, salesSelector } from './selectors';
import { allRevenueTypesSelector } from '../revenueTypeSlice';
import { getFarmExpenseType, getExpense, getSales, setSelectedExpenseTypes } from './actions';
import { calcOtherExpense, calcTotalLabour, calcActualRevenue } from './util';
import Moment from 'moment';
import DateRangeSelector from '../../components/Finances/DateRangeSelector';
import { extendMoment } from 'moment-range';
import { managementPlansSelector } from '../managementPlanSlice';
import { getManagementPlansAndTasks } from '../saga';
import { getRevenueTypes } from './saga';
import Button from '../../components/Form/Button';
import { Semibold, Title } from '../../components/Typography';
import { useCurrencySymbol } from '../hooks/useCurrencySymbol';
import { taskEntitiesByManagementPlanIdSelector, tasksSelector } from '../taskSlice';
import { isTaskType } from '../Task/useIsTaskType';
import { setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { useTranslation } from 'react-i18next';
import { downloadFinanceReport } from './saga';
import FinancesCarrousel from '../../components/Finances/FinancesCarrousel';
import useDateRangeSelector from '../../components/DateRangeSelector/useDateRangeSelector';
import { SUNDAY } from '../../util/dateRange';
import TransactionFilter from './TransactionFilter';
import { transactionsFilterSelector } from '../filterSlice';
import useTransactions from './useTransactions';
import PureTransactionList from '../../components/Finances/Transaction/Mobile/List';
import { roundToTwoDecimal } from '../../util';

const moment = extendMoment(Moment);

const Finances = ({ history }) => {
  const { t } = useTranslation();

  const tasks = useSelector(tasksSelector);
  const expenses = useSelector(expenseSelector);
  const managementPlans = useSelector(managementPlansSelector);
  const { EXPENSE_TYPE: expenseTypeFilter, REVENUE_TYPE: revenueTypeFilter } = useSelector(
    transactionsFilterSelector,
  );
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);
  const { startDate, endDate } = useDateRangeSelector({ weekStartDate: SUNDAY });
  const dateFilter = { startDate, endDate };
  const transactions = useTransactions({ dateFilter, expenseTypeFilter, revenueTypeFilter });
  const currencySymbol = useCurrencySymbol();

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

  const totalRevenue = calcActualRevenue(transactions).toFixed(0);
  const estimatedRevenue = getEstimatedRevenue(managementPlans);
  const labourExpense = roundToTwoDecimal(calcTotalLabour(transactions)).toFixed(0);
  const otherExpense = calcOtherExpense(transactions).toFixed(0);
  const totalExpense = (parseFloat(otherExpense) + parseFloat(labourExpense)).toFixed(0);

  return (
    <div className={styles.financesContainer}>
      <Title style={{ marginBottom: '8px' }}>{t('SALE.FINANCES.TITLE')}</Title>
      <Semibold style={{ marginBottom: '8px' }}>{t('SALE.FINANCES.ACTION')}</Semibold>
      <div className={styles.buttonContainer}>
        <Button
          style={{ height: '48px' }}
          onClick={() => {
            dispatch(setPersistedPaths(['/expense_categories', '/add_expense']));
            history.push('/expense_categories');
          }}
          color="success"
        >
          {t('SALE.FINANCES.ADD_NEW_EXPENSE')}
        </Button>
        <Button
          style={{ height: '48px' }}
          onClick={() => {
            dispatch(setPersistedPaths(['/revenue_types', '/add_sale']));
            history.push('/revenue_types');
          }}
          color="success"
        >
          {t('SALE.FINANCES.ADD_NEW_SALE')}
        </Button>
      </div>
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
      <div className={styles.filterBar}>
        <DateRangeSelector />
        <TransactionFilter />
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
      </div>
      <PureTransactionList data={transactions} />
    </div>
  );
};

export default Finances;
