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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import DescriptiveButton from '../../components/Inputs/DescriptiveButton';
import history from '../../history';
import { dateRangeSelector, expenseSelector, salesSelector } from './selectors';
import { allRevenueTypesSelector } from '../revenueTypeSlice';
import {
  getFarmExpenseType,
  getExpense,
  getSales,
  setDateRange,
  setSelectedExpenseTypes,
} from './actions';
import { calcOtherExpense, calcTotalLabour, calcActualRevenue } from './util';
import Moment from 'moment';
import { roundToTwoDecimal } from '../../util';
import DateRangeSelector from '../../components/Finances/DateRangeSelector';
import InfoBoxComponent from '../../components/InfoBoxComponent';
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

const moment = extendMoment(Moment);

const Finances = () => {
  const { t } = useTranslation();

  const sales = useSelector(salesSelector);
  const tasks = useSelector(tasksSelector);
  const expenses = useSelector(expenseSelector);
  const managementPlans = useSelector(managementPlansSelector);
  const dateRange = useSelector(dateRangeSelector);
  const allRevenueTypes = useSelector(allRevenueTypesSelector);

  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);

  const [startDate, setStartDate] = useState(moment().startOf('year'));
  const [endDate, setEndDate] = useState(moment().endOf('year'));
  const currencySymbol = useCurrencySymbol();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSales());
    dispatch(getExpense());
    dispatch(getFarmExpenseType());
    dispatch(getRevenueTypes());
    dispatch(getManagementPlansAndTasks());
    dispatch(setSelectedExpenseTypes([]));

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      setStartDate(dateRange.startDate);
      setEndDate(dateRange.endDate);
    } else {
      dispatch(
        setDateRange({
          startDate,
          endDate,
        }),
      );
    }
  }, []);

  const changeDate = (type, date) => {
    if (type === 'start') {
      setStartDate(date);
    } else if (type === 'end') {
      setEndDate(date);
    } else {
      console.log('Error, type not specified');
    }
  };

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
    return parseFloat(totalRevenue).toFixed(2);
  };

  const totalRevenue = calcActualRevenue(sales, startDate, endDate, allRevenueTypes).toFixed(2);
  const estimatedRevenue = getEstimatedRevenue(managementPlans);
  const labourExpense = calcTotalLabour(tasks, startDate, endDate).toFixed(2);
  const otherExpense = calcOtherExpense(expenses, startDate, endDate).toFixed(2);
  const totalExpense = (parseFloat(otherExpense) + parseFloat(labourExpense)).toFixed(2);

  return (
    <div className={styles.financesContainer}>
      <Title style={{ marginBottom: '8px' }}>{t('SALE.FINANCES.TITLE')}</Title>
      <hr />
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
      <DateRangeSelector changeDateMethod={changeDate} />
      <FinancesCarrousel
        totalExpense={totalExpense}
        totalRevenue={totalRevenue}
        labourExpense={labourExpense}
        otherExpense={otherExpense}
        estimatedRevenue={estimatedRevenue}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};

export default Finances;
