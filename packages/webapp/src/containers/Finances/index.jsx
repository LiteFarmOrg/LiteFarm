/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import DescriptiveButton from '../../components/Inputs/DescriptiveButton';
import history from '../../history';
import { dateRangeSelector, expenseSelector, salesSelector } from './selectors';
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
import { userFarmSelector } from '../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { managementPlansSelector } from '../managementPlanSlice';
import { getManagementPlansAndTasks } from '../saga';
import Button from '../../components/Form/Button';
import { Semibold, Title } from '../../components/Typography';
import grabCurrencySymbol from '../../util/grabCurrencySymbol';
import { taskEntitiesByManagementPlanIdSelector, tasksSelector } from '../taskSlice';
import { isTaskType } from '../Task/useIsTaskType';
import { setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';

const moment = extendMoment(Moment);

class Finances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf('year'),
      endDate: moment().endOf('year'),
      dButtonStyle: {
        background: '#fff',
        color: '#333',
        borderColor: '#fff',
        boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.2)',
        width: '100%',
      },
      dropDownTitle: this.props.t('SALE.FINANCES.ACTUAL'),
      focusedInput: null,
      hasUnAllocated: false,
      showUnTip: 'none',
      unTipButton: this.props.t('SALE.FINANCES.UNALLOCATED_TIP'),
      currencySymbol: grabCurrencySymbol(),
    };
    this.getEstimatedRevenue = this.getEstimatedRevenue.bind(this);
    this.toggleTip = this.toggleTip.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }

  componentDidMount() {
    const { dateRange } = this.props;
    this.props.dispatch(getSales());
    this.props.dispatch(getExpense());
    this.props.dispatch(getFarmExpenseType());
    this.props.dispatch(getManagementPlansAndTasks());
    this.props.dispatch(setSelectedExpenseTypes([]));
    //TODO fetch userFarm
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      this.setState({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    } else {
      this.props.dispatch(
        setDateRange({
          startDate: this.state.startDate,
          endDate: this.state.endDate,
        }),
      );
    }
  }

  changeDate(type, date) {
    if (type === 'start') {
      this.setState({ startDate: date });
    } else if (type === 'end') {
      this.setState({ endDate: date });
    } else {
      console.log('Error, type not specified');
    }
  }

  getEstimatedRevenue(managementPlans) {
    let totalRevenue = 0;
    if (managementPlans) {
      managementPlans
        .filter(({ abandon_date }) => !abandon_date)
        .forEach((plan) => {
          // check if this plan has a harvest task projected within the time frame
          const harvestTasks =
            this.props.tasksByManagementPlanId[plan.management_plan_id]?.filter((task) =>
              isTaskType(task.taskType, 'HARVEST_TASK'),
            ) || [];
          const harvestDates = harvestTasks?.map((task) =>
            moment(task.due_date).utc().format('YYYY-MM-DD'),
          );

          if (
            harvestDates.some(
              (harvestDate) =>
                moment(this.state.startDate)
                  .startOf('day')
                  .utc()
                  .isSameOrBefore(harvestDate, 'day') &&
                moment(this.state.endDate).utc().isSameOrAfter(harvestDate, 'day'),
            )
          ) {
            totalRevenue += plan.estimated_revenue;
          }
        });
    }
    return parseFloat(totalRevenue).toFixed(2);
  }

  getTotalExpense = () => {
    const { expenses } = this.props;
    const { startDate, endDate } = this.state;

    let total = 0;
    if (expenses && expenses.length) {
      for (let e of expenses) {
        if (
          moment(e.expense_date).isSameOrAfter(startDate, 'day') &&
          moment(e.expense_date).isSameOrBefore(endDate, 'day')
        ) {
          total += Number(e.value);
        }
      }
    }

    return total;
  };

  getCropsByFieldID = (location_id) => {
    const { managementPlans } = this.props;

    let result = new Set();

    for (let fc of managementPlans) {
      if (fc.location_id === location_id) {
        result.add(fc.crop_id);
      }
    }

    return Array.from(result);
  };

  convertToCropID = (final) => {
    let fcIDs = Object.keys(final);
    let result = {};

    const { startDate, endDate } = this.state;
    const { sales } = this.props;

    for (let fkey of fcIDs) {
      let value = final[fkey];
      if (result.hasOwnProperty(value.crop_id)) {
        result[value.crop_id].profit += value.profit;
      } else {
        result[value.crop_id] = {
          crop: this.props.t(`crop:${value.crop_translation_key}`),
          location_id: value.location_id,
          crop_id: value.crop_id,
          profit: value.profit,
        };
      }
    }

    //apply sales
    for (let sale of sales || []) {
      const saleDate = moment(sale.sale_date);

      if (saleDate.isSameOrAfter(startDate, 'day') && saleDate.isSameOrBefore(endDate, 'day')) {
        for (let cp of sale.cropSale) {
          if (cp.crop && result.hasOwnProperty(cp.crop.crop_id)) {
            result[cp.crop.crop_id].profit += Number(cp.sale_value);
          } else {
            result[cp.crop.crop_id] = {
              crop: this.props.t(`crop:${cp.crop.crop_translation_key}`),
              location_id: 'not available',
              crop_id: cp.crop.crop_id,
              profit: Number(cp.sale_value),
            };
          }
        }
      }
    }

    return result;
  };

  toggleTip() {
    let { showUnTip } = this.state;
    let unTipButton;
    if (showUnTip === 'block') {
      showUnTip = 'none';
      unTipButton = this.props.t('SALE.FINANCES.UNALLOCATED_TIP');
    } else {
      showUnTip = 'block';
      unTipButton = this.props.t('common:HIDE');
    }
    this.setState({ showUnTip, unTipButton });
  }

  render() {
    const totalRevenue = calcActualRevenue(
      this.props.sales,
      this.state.startDate,
      this.state.endDate,
    ).toFixed(2);
    const estimatedRevenue = this.getEstimatedRevenue(this.props.managementPlans);
    const { tasks, expenses } = this.props;
    const { startDate, endDate, hasUnAllocated, showUnTip, unTipButton } = this.state;
    const labourExpense = roundToTwoDecimal(calcTotalLabour(tasks, startDate, endDate));
    const otherExpense = calcOtherExpense(expenses, startDate, endDate);
    const totalExpense = (parseFloat(otherExpense) + parseFloat(labourExpense)).toFixed(2);
    return (
      <div className={styles.financesContainer}>
        <Title style={{ marginBottom: '8px' }}>{this.props.t('SALE.FINANCES.TITLE')}</Title>
        <hr />
        <Semibold style={{ marginBottom: '8px' }}>{this.props.t('SALE.FINANCES.ACTION')}</Semibold>
        <div className={styles.buttonContainer}>
          <Button
            sm
            style={{ height: '48px' }}
            onClick={() => {
              this.props.dispatch(
                setPersistedPaths([
                  '/expense_categories',
                  '/add_expense',
                  '/manage_custom_expenses',
                ]),
              );
              history.push('/expense_categories');
            }}
          >
            {this.props.t('SALE.FINANCES.ADD_NEW_EXPENSE')}
          </Button>
          <Button
            sm
            style={{ height: '48px' }}
            onClick={() => {
              this.props.dispatch(
                setPersistedPaths(['/revenue_types', '/add_sale', '/manage_custom_revenues']),
              );
              history.push('/revenue_types');
            }}
          >
            {this.props.t('SALE.FINANCES.ADD_NEW_SALE')}
          </Button>
        </div>
        <hr />
        <DateRangeSelector changeDateMethod={this.changeDate} />

        <hr />
        <div data-test="finance_summary" className={styles.align}>
          <Semibold style={{ marginBottom: '8px' }}>
            {this.props.t('SALE.FINANCES.EXPENSES')}
          </Semibold>
          <DescriptiveButton
            label={this.props.t('SALE.FINANCES.LABOUR_LABEL')}
            number={this.state.currencySymbol + labourExpense.toFixed(2)}
            onClick={() => history.push('/labour')}
          />
          <DescriptiveButton
            label={this.props.t('SALE.FINANCES.OTHER_EXPENSES_LABEL')}
            number={this.state.currencySymbol + otherExpense.toFixed(2)}
            onClick={() => history.push('/other_expense')}
          />

          <hr />
          <Semibold style={{ marginBottom: '8px' }}>
            {this.props.t('SALE.FINANCES.REVENUE')}
          </Semibold>
          <DescriptiveButton
            label={this.props.t('SALE.FINANCES.ACTUAL_REVENUE_LABEL')}
            number={this.state.currencySymbol + totalRevenue}
            onClick={() => history.push('/finances/actual_revenue')}
          />
          <DescriptiveButton
            label={this.props.t('SALE.FINANCES.ACTUAL_REVENUE_ESTIMATED')}
            number={this.state.currencySymbol + estimatedRevenue}
            onClick={() => history.push('/estimated_revenue')}
          />

          <hr />
          <div>
            <Semibold style={{ marginBottom: '8px', float: 'left' }}>
              {this.props.t('SALE.FINANCES.BALANCE_FOR_FARM')}
            </Semibold>
            <InfoBoxComponent
              customStyle={{
                float: 'right',
                fontSize: '80%',
                position: 'relative',
              }}
              title={this.props.t('SALE.FINANCES.FINANCE_HELP')}
              body={this.props.t('SALE.FINANCES.BALANCE_EXPLANATION')}
            />
          </div>
          <div className={styles.greyBox}>
            <div className={styles.balanceDetail}>
              <p>{this.props.t('SALE.FINANCES.REVENUE')}:</p>{' '}
              <p>{this.state.currencySymbol + totalRevenue}</p>
            </div>
            <div className={styles.balanceDetail}>
              <p>{this.props.t('SALE.FINANCES.EXPENSES')}:</p>
              <p>{this.state.currencySymbol + totalExpense.toString()}</p>
            </div>
            <div className={styles.balanceDetail}>
              <p>{this.props.t('SALE.FINANCES.BALANCE')}:</p>
              <p>
                {this.state.currencySymbol +
                  (parseFloat(totalRevenue) - parseFloat(totalExpense)).toFixed(2)}
              </p>
            </div>
          </div>

          {/* 
            {hasUnAllocated && (
              <div className={styles.tipButton} onClick={() => this.toggleTip()}>
                {unTipButton}
              </div>
            )}
            {hasUnAllocated && (
              <Alert variant="warning" style={{ marginTop: '8px', display: showUnTip }}>
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE1')} <br />
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE2')}
                <br />
                <br />
                {this.props.t('common:EG')}
                <br />
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE3_1')}{' '}
                <code>{this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE3_2')}</code>{' '}
                {this.props.t('common:TO')}{' '}
                <code>{this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE3_3')}</code>
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE4')}{' '}
                <code>{this.props.t('common:LOCATION')}1</code> &{' '}
                <code>{this.props.t('common:LOCATION')}2</code>.<br />
                <br />
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE5_1')}
                {this.state.currencySymbol}
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE5_2')},
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE6_1')}{' '}
                <code>
                  {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE6_2')}
                  {this.state.currencySymbol}60
                </code>
                .<br />
                <br />
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE7_1')}{' '}
                <code>{this.props.t('common:LOCATION')}1</code>{' '}
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE7_2')}
                <code>
                  {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE8')}
                  {this.state.currencySymbol}30
                </code>
                .<br />
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE9')}{' '}
                <code>
                  {this.state.currencySymbol}30/2 = {this.state.currencySymbol}
                  15
                </code>
                .<br />
                <br />
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE10_1')}
                <code>{this.state.currencySymbol}30</code>{' '}
                {this.props.t('SALE.FINANCES.HAS_UNALLOCATED_LINE10_2')}
              </Alert>
            )}
          </div> */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sales: salesSelector(state),
    tasks: tasksSelector(state),
    expenses: expenseSelector(state),
    managementPlans: managementPlansSelector(state),
    dateRange: dateRangeSelector(state),
    farm: userFarmSelector(state),
    tasksByManagementPlanId: taskEntitiesByManagementPlanIdSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Finances));
