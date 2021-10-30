/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
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
import { dateRangeSelector, expenseSelector, salesSelector, shiftSelector } from './selectors';
import { getDefaultExpenseType, getExpense, getSales, getShifts, setDateRange } from './actions';
import { calcOtherExpense, calcTotalLabour, filterSalesByCurrentYear } from './util';
import Moment from 'moment';
import { Alert } from 'react-bootstrap';
import { roundToTwoDecimal } from '../../util';
import DateRangeSelector from '../../components/Finances/DateRangeSelector';
import InfoBoxComponent from '../../components/InfoBoxComponent';
import { extendMoment } from 'moment-range';
import { userFarmSelector } from '../userFarmSlice';
import { withTranslation } from 'react-i18next';
import {
  currentAndPlannedManagementPlansSelector,
  managementPlansSelector,
} from '../managementPlanSlice';
import { getManagementPlans } from '../saga';
import Button from '../../components/Form/Button';
import { Semibold, Title } from '../../components/Typography';
import grabCurrencySymbol from '../../util/grabCurrencySymbol';
import { taskEntitiesByManagementPlanIdSelector, tasksSelector } from '../taskSlice';

const moment = extendMoment(Moment);

class Finances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balanceByCrop: [],
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
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    this.getRevenue = this.getRevenue.bind(this);
    this.getEstimatedRevenue = this.getEstimatedRevenue.bind(this);
    // this.calcBalanceByCrop = this.calcBalanceByCrop.bind(this);
    this.getShiftCropOnField = this.getShiftCropOnField.bind(this);
    this.toggleTip = this.toggleTip.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }

  //TODO: filter revenue of cropSales for the current year?
  getRevenue() {
    let cropVarietySale = [];
    if (this.props.sales && Array.isArray(this.props.sales)) {
      filterSalesByCurrentYear(this.props.sales).map((s) => {
        return s.crop_variety_sale.map((cvs) => {
          return cropVarietySale.push(cvs);
        });
      });
    }
    let totalRevenue = 0;
    cropVarietySale.map((cvs) => {
      return (totalRevenue += cvs.sale_value || 0);
    });
    return totalRevenue.toFixed(2);
  }

  componentDidMount() {
    const { dateRange } = this.props;
    this.props.dispatch(getSales());
    this.props.dispatch(getShifts());
    this.props.dispatch(getExpense());
    this.props.dispatch(getDefaultExpenseType());
    this.props.dispatch(getManagementPlans());
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
    // this.calcBalanceByCrop();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (
      this.props.shifts !== prevProps.shifts ||
      this.props.sales !== prevProps.sales ||
      this.props.expenses !== prevProps.expenses ||
      this.props.dateRange !== prevProps.dateRange
    ) {
      // this.calcBalanceByCrop();
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
          const harvestTasks = this.props.tasksByManagementPlanId[plan.management_plan_id]?.filter(
            (task) => task.task_type_id === 8,
          );
          const harvestDates = harvestTasks?.map((task) =>
            moment(task.due_date).utc().format('YYYY-MM-DD'),
          );

          if (
            harvestDates.some(
              (harvestDate) =>
                moment(this.state.startDate).isSameOrBefore(harvestDate, 'day') &&
                moment(this.state.endDate).isSameOrAfter(harvestDate, 'day'),
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
          moment(e.expense_date).isSameOrAfter(moment(startDate)) &&
          moment(e.exports).isSameOrBefore(moment(endDate))
        ) {
          total += Number(e.value);
        }
      }
    }

    return total;
  };

  // TODO: currently commented out all usages of this function, until ful refactor to crop variety
  calcBalanceByCrop() {
    const { shifts, sales, expenses } = this.props;
    const { startDate, endDate } = this.state;

    if (!(shifts || sales || expenses)) return;

    let final = Object.assign({}, {}); // crop: crop name, profit: number

    let unAllocated = 0;
    let unAllocatedShifts = {};

    let totalExpense = this.getTotalExpense();

    if (shifts && shifts.length) {
      for (let s of shifts) {
        let management_plan_id = s.management_plan_id;
        if (
          moment(s.shift_date).isSameOrAfter(moment(startDate)) &&
          moment(s.shift_date).isSameOrBefore(moment(endDate))
        ) {
          if (management_plan_id !== null) {
            if (final.hasOwnProperty(management_plan_id)) {
              final[management_plan_id].profit =
                final[management_plan_id].profit +
                Number(s.wage_at_moment) * (Number(s.duration) / 60) * -1;
            } else {
              final[management_plan_id] = {
                profit: Number(s.wage_at_moment) * (Number(s.duration) / 60) * -1,
                crop_translation_key: s.crop_translation_key,
                location_id: s.location_id,
                crop_id: s.crop_id,
                management_plan_id: s.management_plan_id,
              };
            }
          }
          // else it's unallocated
          else {
            if (unAllocatedShifts.hasOwnProperty(s.location_id)) {
              unAllocatedShifts[s.location_id].value =
                unAllocatedShifts[s.location_id].value +
                Number(s.wage_at_moment) * (Number(s.duration) / 60);
            } else {
              unAllocatedShifts = Object.assign(unAllocatedShifts, {
                [s.location_id]: {
                  value: Number(s.wage_at_moment) * (Number(s.duration) / 60),
                  hasAllocated: false,
                },
              });
            }
          }
        }
      }
    }

    // balance by crop used to be sorted by field crop,
    // i'm keeping the original code, and will modify the <final> object to make it sorted by crop
    final = this.convertToCropID(final);

    // allocate unallocated to used-to-be fields
    let ukeys = Object.keys(unAllocatedShifts);
    for (let uk of ukeys) {
      // uk = location_id
      let uShift = unAllocatedShifts[uk];

      // a list of crop ids
      let waitForAllocate = this.getCropsByFieldID(uk);

      let avg = Number(parseFloat(uShift.value / waitForAllocate.length).toFixed(2));

      let fkeys = Object.keys(final);

      for (let wa of waitForAllocate) {
        for (let fk of fkeys) {
          if (Number(fk) === Number(wa)) {
            final[fk].profit -= avg;
          }
        }
      }

      if (waitForAllocate.length > 0) {
        unAllocatedShifts[uk].hasAllocated = true;
      }
    }

    let cropKeys = Object.keys(final);
    let averageExpense = Number(parseFloat(totalExpense / cropKeys.length).toFixed(2));
    // apply expense evenly to each crop
    for (let ck of cropKeys) {
      final[ck].profit -= averageExpense;
    }

    for (let uk of ukeys) {
      let uShift = unAllocatedShifts[uk];
      if (!uShift.hasAllocated) {
        unAllocated += uShift.value;
      }
    }

    if (unAllocated !== 0) {
      final = Object.assign(final, {
        unallocated: {
          crop: this.props.t('SALE.FINANCES.UNALLOCATED_CROP'),
          profit: unAllocated * -1,
        },
      });
    }

    this.setState({
      balanceByCrop: Object.values(final),
    });
  }

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
      if (
        moment(sale.sale_date).isSameOrAfter(moment(startDate)) &&
        moment(sale.sale_date).isSameOrBefore(moment(endDate))
      ) {
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

  getShiftCropOnField(location_id) {
    const { shifts } = this.props;

    let crops = [];

    for (let s of shifts) {
      if (s.location_id === location_id && s.crop_id) {
        crops.push(s.crop_id);
      }
    }

    return crops;
  }

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
    const totalRevenue = this.getRevenue();
    const estimatedRevenue = this.getEstimatedRevenue(this.props.managementPlans);
    const { tasks, expenses } = this.props;
    const {
      balanceByCrop,
      startDate,
      endDate,
      hasUnAllocated,
      showUnTip,
      unTipButton,
    } = this.state;
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
              history.push('/expense_categories');
            }}
          >
            {this.props.t('SALE.FINANCES.ADD_NEW_EXPENSE')}
          </Button>
          <Button
            sm
            style={{ height: '48px' }}
            onClick={() => {
              history.push('add_sale');
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
            number={this.state.currencySymbol + labourExpense.toFixed(2).toString()}
            onClick={() => history.push('/labour')}
          />
          <DescriptiveButton
            label={this.props.t('SALE.FINANCES.OTHER_EXPENSES_LABEL')}
            number={this.state.currencySymbol + otherExpense.toString()}
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
          <Semibold style={{ marginBottom: '8px' }}>
            {this.props.t('SALE.FINANCES.BALANCE_FOR_FARM')}
          </Semibold>
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

          <InfoBoxComponent
            customStyle={{
              float: 'right',
              fontSize: '80%',
              marginTop: '0.2em',
              position: 'relative',
            }}
            title={this.props.t('SALE.FINANCES.FINANCE_HELP')}
            body={this.props.t('SALE.FINANCES.BALANCE_EXPLANATION')}
          />
          {/* <Semibold style={{ marginBottom: '8px', textAlign: 'left' }}>
            {this.props.t('SALE.FINANCES.BALANCE_BY_CROP')}
          </Semibold>

          <div className={styles.greyBox}>
            {balanceByCrop.map((b) => {
              return (
                <div key={b.crop} className={styles.balanceDetail}>
                  <p>{b.crop}</p>
                  <p>{this.state.currencySymbol + b.profit.toFixed(2)}</p>
                </div>
              );
            })}
            {balanceByCrop.length < 1 && (
              <h4>{this.props.t('SALE.FINANCES.ENSURE_ONE_CROP_WARNING')}</h4>
            )}
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
    shifts: shiftSelector(state),
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
