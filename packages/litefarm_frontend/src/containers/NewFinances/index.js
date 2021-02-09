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
import styles from '../Finances/styles.module.scss';
import newStyles from './styles.module.scss';
import { connect } from 'react-redux';
import Table from '../../components/Table';
import history from '../../history';
import { getExpense, getSales, getShifts } from '../Finances/actions';
import { calcBalanceByCrop, calcOtherExpense, calcSales, calcTotalLabour } from '../Finances/util';
import moment from 'moment';
import { expenseSelector, salesSelector, shiftSelector } from '../Finances/selectors';
import { BsChevronRight } from 'react-icons/all';
import { withTranslation } from 'react-i18next';

class NewFinances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      totalExpenses: 0,
      totalSales: 0,
      totalBalance: 0,
      startDate: moment().startOf('year'),
      endDate: moment().endOf('year'),
      bestCrops: [],
      worstCrops: [],
    };
  }

  componentDidMount() {
    this.props.dispatch(getSales());
    this.props.dispatch(getShifts());
    this.props.dispatch(getExpense());
    const { shifts, expenses, sales } = this.props;

    const otherExpense = calcOtherExpense(expenses, this.state.startDate, this.state.endDate);
    const labourExpense = calcTotalLabour(shifts, this.state.startDate, this.state.endDate);
    const sumExpenses = (parseFloat(otherExpense) + parseFloat(labourExpense)).toFixed(2);
    const calculatedBalanceByCrop = calcBalanceByCrop(
      shifts,
      sales,
      expenses,
      this.state.startDate,
      this.state.endDate,
    );
    calculatedBalanceByCrop.sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit)); // sort descending
    const bestCrops = calculatedBalanceByCrop.splice(
      0,
      Math.ceil(calculatedBalanceByCrop.length / 2),
    ); // taking the first half of array
    const worstCrops = calculatedBalanceByCrop; // taking second half of array
    this.setState({ bestCrops: bestCrops });
    this.setState({ worstCrops: worstCrops });

    const sumSales = calcSales(sales, this.state.startDate, this.state.endDate);
    this.setState({ totalExpenses: sumExpenses });
    this.setState({ totalSales: sumSales });
    this.setState({ totalBalance: (sumSales - sumExpenses).toFixed(2) });
  }

  render() {
    return (
      <div className={styles.financesContainer}>
        <h4>
          <strong>{this.props.t('NEW_FINANCES.TITLE')}</strong>
        </h4>
        <hr />
        <div>
          <div>
            <h4>
              <strong>
                {this.props.t('NEW_FINANCES.SUMMARY_REPORT')}{' '}
                {this.state.startDate.format('MMM YYYY')} - {this.state.endDate.format('MMM YYYY')}
              </strong>
            </h4>
          </div>
          <div className={styles.salesContainer}>
            <h5 className={styles.balanceTitle}>
              <strong>{this.props.t('NEW_FINANCES.SALES')}</strong>
            </h5>
            <button
              style={{ float: 'right' }}
              onClick={() => {
                history.push('/newfinances/sales');
              }}
            >
              <BsChevronRight />
            </button>
            <div style={{ float: 'right' }}>${this.state.totalSales}</div>
          </div>
          <div className={styles.expenseContainer}>
            <div>
              <h5 className={styles.balanceTitle}>
                <strong>{this.props.t('NEW_FINANCES.EXPENSES')}</strong>
              </h5>
              <button
                style={{ float: 'right', clear: 'both' }}
                onClick={() => {
                  history.push('/newfinances/expenses');
                }}
              >
                <BsChevronRight />
              </button>
              <div style={{ float: 'right' }}>${this.state.totalExpenses}</div>
            </div>
          </div>
          <hr />
          <div className={styles.balanceContainer}>
            <h5 className={styles.balanceTitle}>
              <strong>{this.props.t('NEW_FINANCES.BALANCE')}</strong>
            </h5>
            <button
              style={{ float: 'right' }}
              onClick={() => {
                history.push('/newfinances/balances');
              }}
            >
              <BsChevronRight />
            </button>
            <div style={{ float: 'right' }}>${this.state.totalBalance}</div>
          </div>
          <div className={styles.table}>
            <div className={newStyles.floatLeft}>
              <Table
                columns={bestCropColumns}
                showPagination={false}
                data={this.state.bestCrops}
                minRows={3}
                getTdProps={() => {
                  return {
                    onClick: (e, handleOriginal) => {
                      history.push('/newfinances/balances');
                      if (handleOriginal) {
                        handleOriginal();
                      }
                    },
                  };
                }}
                className={'-striped -highlight'}
              />
            </div>
            <div className={newStyles.floatRight}>
              <Table
                columns={worstCropColumns}
                data={this.state.worstCrops}
                showPagination={false}
                minRows={3}
                getTdProps={() => {
                  return {
                    onClick: (e, handleOriginal) => {
                      history.push('/newfinances/balances');
                      if (handleOriginal) {
                        handleOriginal();
                      }
                    },
                  };
                }}
                className={'-striped -highlight'}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sales: salesSelector(state),
    shifts: shiftSelector(state),
    expenses: expenseSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

// columns for the react-table
const bestCropColumns = [
  {
    id: 'best',
    Header: 'Best',
    accessor: (d) => d.crop,
    minWidth: 85,
  },
  {
    id: 'value',
    Header: '$',
    accessor: (d) => d.profit,
    minWidth: 85,
  },
];

const worstCropColumns = [
  {
    id: 'worst',
    Header: 'Worst',
    accessor: (d) => d.crop,
    minWidth: 50,
  },
  {
    id: 'value',
    Header: '$',
    accessor: (d) => d.profit,
    minWidth: 50,
  },
];

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(NewFinances));
