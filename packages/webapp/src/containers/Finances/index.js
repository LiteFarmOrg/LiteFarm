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

import React, {Component} from "react";
import {connect} from 'react-redux';
import styles from './styles.scss';
import {Button} from 'react-bootstrap';
import DescriptiveButton from '../../components/Inputs/DescriptiveButton';
import history from '../../history';
import {salesSelector, shiftSelector, expenseSelector, dateRangeSelector} from "./selectors";
import {cropSelector as fieldCropSelector, farmSelector} from '../selector';
import {getExpense, getSales, getShifts, getDefaultExpenseType, setDateRange} from './actions';
import {calcTotalLabour, calcOtherExpense, filterSalesByCurrentYear} from './util';
import {fetchFarmInfo, getFieldCrops} from "../actions";
import Moment from 'moment';
import {Alert} from 'react-bootstrap';
import {roundToTwoDecimal, grabCurrencySymbol} from "../../util";
import DateRangeSelector from "../../components/Finances/DateRangeSelector";
import InfoBoxComponent from "../../components/InfoBoxComponent";
import {extendMoment} from 'moment-range';

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
      dropDownTitle: 'Actual',
      focusedInput: null,
      hasUnAllocated: false,
      showUnTip: 'none',
      unTipButton: 'What is unallocated?',
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    this.getRevenue = this.getRevenue.bind(this);
    this.getEstimatedRevenue = this.getEstimatedRevenue.bind(this);
    this.calcBalanceByCrop = this.calcBalanceByCrop.bind(this);
    this.getShiftCropOnField = this.getShiftCropOnField.bind(this);
    this.toggleTip = this.toggleTip.bind(this);
    this.changeDate = this.changeDate.bind(this);
  };

  //TODO: filter revenue of cropSales for the current year?
  getRevenue() {
    let cropSales = [];
    if (this.props.sales && Array.isArray(this.props.sales)) {
      filterSalesByCurrentYear(this.props.sales).map((s) => {
        return s.cropSale.map((cs) => {
          return cropSales.push(cs);
        });
      });
    }
    let totalRevenue = 0;
    cropSales.map((cs) => {
      return totalRevenue += cs.sale_value || 0;
    });
    return totalRevenue.toFixed(2);
  }

  componentDidMount() {
    const {dateRange} = this.props;
    this.props.dispatch(getSales());
    this.props.dispatch(getShifts());
    this.props.dispatch(getExpense());
    this.props.dispatch(getDefaultExpenseType());
    this.props.dispatch(getFieldCrops());
    this.props.dispatch(fetchFarmInfo(localStorage.getItem('farm_id')));

    if(dateRange && dateRange.startDate && dateRange.endDate){
      this.setState({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }else{
      this.props.dispatch(setDateRange({startDate: this.state.startDate, endDate: this.state.endDate}));
    }
    this.calcBalanceByCrop();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.shifts !== prevProps.shifts || this.props.sales !== prevProps.sales || this.props.expenses !== prevProps.expenses
      || this.props.dateRange !== prevProps.dateRange
    ) {
      this.calcBalanceByCrop();
    }
  }

  changeDate(type, date) {
    if (type === 'start') {
      this.setState({startDate: date});
    } else if (type === 'end') {
      this.setState({endDate: date});
    } else {
      console.log("Error, type not specified")
    }
  }

  getEstimatedRevenue(fieldCrops) {
    let totalRevenue = 0;
    if (fieldCrops) {
      fieldCrops.forEach((f) => {
        // check if this field crop existed during this year
        const endDate = new Date(f.end_date);
        // get all field crops with end dates belonging to the chosen date window
        if ((this.state.startDate && this.state.startDate._d) <= endDate && (this.state.endDate && this.state.endDate._d) >= endDate) {
          totalRevenue += f.estimated_revenue;
        }
      })
    }
    return parseFloat(totalRevenue).toFixed(2);
  }

  getTotalExpense = () => {
    const {expenses} = this.props;
    const {startDate, endDate} = this.state;

    let total = 0;
    if (expenses && expenses.length) {
      for (let e of expenses) {
        if (moment(e.expense_date).isBetween(startDate, endDate)) {
          total += Number(e.value);
        }
      }
    }


    return total;
  };


  calcBalanceByCrop() {
    const {shifts, sales, expenses} = this.props;
    const {startDate, endDate} = this.state;

    if (!(shifts || sales || expenses)) return;

    let final = Object.assign({}, {}); // crop: crop name, profit: number

    let unAllocated = 0;
    let unAllocatedShifts = {};

    let totalExpense = this.getTotalExpense();

    if (shifts && shifts.length) {
      for (let s of shifts) {
        let field_crop_id = s.field_crop_id;
        if (moment(s.start_time).isBetween(startDate, endDate)) {
          if (field_crop_id !== null) {
            if (final.hasOwnProperty(field_crop_id)) {
              final[field_crop_id].profit = final[field_crop_id].profit + (Number(s.wage_at_moment) * (Number(s.duration) / 60) * (-1));
            } else {
              final[field_crop_id] = {
                profit: Number(s.wage_at_moment) * (Number(s.duration) / 60) * (-1),
                crop: s.crop_common_name,
                field_id: s.field_id,
                crop_id: s.crop_id,
                field_crop_id: s.field_crop_id,
              }
            }
          }
          // else it's unallocated
          else {
            if (unAllocatedShifts.hasOwnProperty(s.field_id)) {
              unAllocatedShifts[s.field_id].value = unAllocatedShifts[s.field_id].value + Number(s.wage_at_moment) * (Number(s.duration) / 60);
            } else {
              unAllocatedShifts = Object.assign(unAllocatedShifts, {
                [s.field_id]: {
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
      // uk = field_id
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
        'unallocated': {
          crop: 'Unallocated',
          profit: unAllocated * -1,
        }
      })
    }


    this.setState({
      balanceByCrop: Object.values(final),
    })
  }

  getCropsByFieldID = (field_id) => {
    const {fieldCrops} = this.props;

    let result = new Set();

    for(let fc of fieldCrops){
      if(fc.field_id === field_id){
        result.add(fc.crop_id);
      }
    }

    return Array.from(result);
  };

  convertToCropID = (final) => {
    let fcIDs = Object.keys(final);
    let result = {};

    const {startDate, endDate} = this.state;
    const {sales} = this.props;

    for (let fkey of fcIDs) {
      let value = final[fkey];
      if (result.hasOwnProperty(value.crop_id)) {
        result[value.crop_id].profit += value.profit;
      } else {
        result[value.crop_id] = {
          crop: value.crop,
          field_id: value.field_id,
          crop_id: value.crop_id,
          profit: value.profit,
        }
      }
    }

    //apply sales
    for (let sale of sales || []) {
      if (moment(sale.sale_date).isBetween(startDate, endDate)) {
        for (let cp of sale.cropSale) {
          if (cp.crop && result.hasOwnProperty(cp.crop.crop_id)) {
            result[cp.crop.crop_id].profit += Number(cp.sale_value);
          }else{
            result[cp.crop.crop_id] = {
              crop: cp.crop.crop_common_name,
              field_id: 'not available',
              crop_id: cp.crop.crop_id,
              profit: Number(cp.sale_value),
            }
          }
        }
      }
    }

    return result;
  };

  getShiftCropOnField(field_id) {
    const {shifts} = this.props;

    let crops = [];

    for (let s of shifts) {
      if (s.field_id === field_id && s.crop_id) {
        crops.push(s.crop_id);
      }
    }

    return crops;

  }

  toggleTip() {
    let {showUnTip} = this.state;
    let unTipButton;
    if (showUnTip === 'block') {
      showUnTip = 'none';
      unTipButton = 'What is unallocated?';
    }
    else {
      showUnTip = 'block';
      unTipButton = 'Hide';
    }
    this.setState({showUnTip, unTipButton});
  }

  render() {
    const totalRevenue = this.getRevenue();
    const estimatedRevenue = this.getEstimatedRevenue(this.props.fieldCrops);
    const {shifts, expenses} = this.props;
    const {balanceByCrop, startDate, endDate, hasUnAllocated, showUnTip, unTipButton} = this.state;
    const labourExpense = roundToTwoDecimal(calcTotalLabour(shifts, startDate, endDate));
    const otherExpense = calcOtherExpense(expenses, startDate, endDate);
    const totalExpense = (parseFloat(otherExpense) + parseFloat(labourExpense)).toFixed(2);
    return (
      <div className={styles.financesContainer}>
        <h4>
          <strong>FINANCES</strong>
        </h4>
        <hr/>
        <h4><b>Action</b></h4>
        <div className={styles.buttonContainer}>
          <Button onClick={() => {
            history.push('/expense_categories')
          }}>Add New Expense </Button>
          <Button onClick={() => {
            history.push('add_sale')
          }}>Add New Sale</Button>
        </div>
        <hr/>
        <DateRangeSelector changeDateMethod={this.changeDate}/>

        <hr/>
        <div data-test="finance_summary" className={styles.align}>
          <h5 className={styles.balanceTitle}>
            <strong>Expenses</strong>
          </h5>
          <DescriptiveButton label='Labour' number={this.state.currencySymbol + labourExpense.toString()}
                             onClick={() => history.push('/labour')}/>
          <DescriptiveButton label='Other Expenses' number={this.state.currencySymbol + otherExpense.toString()}
                             onClick={() => history.push('/other_expense')}/>

          <hr/>
          <h5 className={styles.balanceTitle}>
            <strong>Revenue</strong>
          </h5>
          <DescriptiveButton label='Actual' number={this.state.currencySymbol + totalRevenue}
                             onClick={() => history.push('/sales_summary')}/>
          <DescriptiveButton label='Estimated' number={this.state.currencySymbol + estimatedRevenue}
                             onClick={() => history.push('/estimated_revenue')}/>

          <hr/>
          <h5 className={styles.balanceTitle}>
            <strong>Balance (Whole Farm)</strong>
          </h5>
          <div className={styles.greyBox}>
            <div className={styles.balanceDetail}><p>Revenue:</p> <p>{this.state.currencySymbol + totalRevenue}</p>
            </div>
            <div className={styles.balanceDetail}><p>Expense:</p>
              <p>{this.state.currencySymbol + totalExpense.toString()}</p></div>
            <div className={styles.balanceDetail}><p>Balance:</p>
              <p>{this.state.currencySymbol + (parseFloat(totalRevenue) - parseFloat(totalExpense)).toFixed(2)}</p>
            </div>
          </div>

          <h5 className={styles.balanceTitle}>
            <InfoBoxComponent customStyle={{float: 'right', fontSize: '80%', marginTop: '0.2em'}} title={"Finance Help"}
                              body = {"We compute a real-time balance (‘cost of production’) for each crop on your farm. " +
                                "This is a simple equation of expenses minus revenue.  Expenses for each crop are calculated from two parts, " +
                                "one part is the labour expenses from hours logged for farm activities, the other part is from the other expenses " +
                                "logged for the whole farm. Where expenses are logged for the whole farm we equally divide them amongst the crops on the farm. " +
                                "Unallocated means that a shift(s) has been submitted for a field when there is not a crop yet on that field. " +
                                "This shift(s) will be assigned to crops as they are added to that field within the financial reporting time window."}/>
            <strong>Balance (By Crop)</strong>
          </h5>
          <div className={styles.greyBox}>
            {
              balanceByCrop.map((b) => {
                return (
                  <div key={b.crop} className={styles.balanceDetail}><p>{b.crop}</p>
                    <p>{this.state.currencySymbol + b.profit.toFixed(2)}</p></div>
                )
              })
            }
            {
              balanceByCrop.length < 1 &&
              <h4>Please ensure that at least 1 crop and an associated sale or shift has been allocated to see this information.</h4>
            }
            {
              hasUnAllocated &&
              <div className={styles.tipButton} onClick={() => this.toggleTip()}>{unTipButton}</div>
            }
            {
              hasUnAllocated &&
              <Alert variant="warning" style={{marginTop: '8px', display: showUnTip}}>
                *Unallocated means that work has been done on an empty field for the selected date range. <br/>
                If one or more crops were added to an empty field later and there exists a shift related to the crops,
                then the work done on that empty field will be evenly distributed to each crop.<br/>
                <br/>
                E.g.<br/>
                For date range <code>January 1st</code> to <code>April 1st</code>
                and two empty field <code>Field1</code> & <code>Field2</code>.<br/><br/>
                Assume shifts has been submitted for both fields(cost={this.state.currencySymbol}30 for each field),
                then the Unallocated value would be <code>Field1's work + Field2's work =
                -{this.state.currencySymbol}60</code>.<br/><br/>
                Later corn and lettuce has been planted on <code>Field1</code> and related shifts have been submitted
                within the date range, then the Unallocated value would be
                <code>Field2's work = -{this.state.currencySymbol}30</code>.<br/>
                Corn and lettuce will each be allocated with an extra cost of <code>{this.state.currencySymbol}30/2
                = {this.state.currencySymbol}15</code>.<br/><br/>
                If lettuce is added to Field1 but no shift related to lettuce or Field1 is submitted, or submitted later
                than April 1st,
                then Corn will be allocated with a full amount of <code>{this.state.currencySymbol}30</code> from
                Field1.
              </Alert>
            }

          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    sales: salesSelector(state),
    shifts: shiftSelector(state),
    expenses: expenseSelector(state),
    fieldCrops: fieldCropSelector(state),
    dateRange: dateRangeSelector(state),
    farm: farmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Finances);
