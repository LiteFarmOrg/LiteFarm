import React, { Component } from 'react';
import moment from 'moment';
import styles from './styles.scss';
import {
  expenseSelector,
  expenseTypeSelector,
  dateRangeSelector,
} from '../../../../Finances/selectors';
import Table from '../../../../../components/Table';
import { setExpenseDetailDate, getExpense } from '../../../../Finances/actions';
import history from '../../../../../history';
import { connect } from 'react-redux';

class OtherExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      data: [],
      totalExpense: 0,
      subTotal: 0,
      detailedHistory: [],
      sortMonth: 0,
      dropDownTitle: 'All Months',
      dButtonStyle: {
        background: '#fff',
        color: '#333',
        borderColor: '#fff',
        boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.2)',
        width: '100%',
        marginBottom: '10px',
      },
    };
    this.computeTable = this.computeTable.bind(this);
    this.getExpenseType = this.getExpenseType.bind(this);
    this.computeDetailedTable = this.computeDetailedTable.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getExpense());
    this.computeTable();
    this.computeDetailedTable();
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.expenses !== prevProps.expenses) {
      this.computeTable();
      this.computeDetailedTable();
    }
  }

  computeTable() {
    const { expenses, dateRange } = this.props;
    let dict = {};

    for (let e of expenses) {
      if (
        moment(e.expense_date).isBetween(moment(dateRange.startDate), moment(dateRange.endDate))
      ) {
        let id = e.expense_type_id;
        if (!dict.hasOwnProperty(id)) {
          let typeName = this.getExpenseType(id);
          dict[id] = {
            type: typeName,
            amount: e.value,
          };
        } else {
          dict[id].amount = dict[id].amount + e.value;
        }
      }
    }

    let data = [];
    let keys = Object.keys(dict);
    let total = 0;

    for (let k of keys) {
      data.push({
        type: dict[k].type,
        amount: '$' + dict[k].amount.toFixed(2).toString(),
      });
      total += dict[k].amount;
    }

    this.setState({
      data,
      totalExpense: total.toFixed(2),
    });
  }

  computeDetailedTable() {
    const { expenses, dateRange } = this.props;
    let detailedHistory = [];
    this.setState({
      detailedHistory,
    });

    let dict = {};
    let subTotal = 0;

    for (let e of expenses) {
      if (
        moment(e.expense_date).isBetween(moment(dateRange.startDate), moment(dateRange.endDate))
      ) {
        let date = moment(e.expense_date).format('MMM-DD-YYYY');
        let type = this.getExpenseType(e.expense_type_id);
        let amount = parseFloat(e.value);
        subTotal += amount;
        if (!dict.hasOwnProperty(date)) {
          dict[date] = {
            type,
            amount,
            expense_date: e.expense_date,
          };
        } else {
          dict[date].amount = dict[date].amount + amount;
          dict[date].type = 'Multiple';
        }
      }
    }

    let keys = Object.keys(dict);
    for (let k of keys) {
      detailedHistory.push({
        date: k,
        type: dict[k].type,
        amount: '$' + dict[k].amount.toFixed(2).toString(),
        expense_date: dict[k].expense_date,
      });
    }
    this.setState({
      detailedHistory,
      subTotal: subTotal.toFixed(2),
    });
  }

  getExpenseType(id) {
    const { expenseTypes } = this.props;
    for (let type of expenseTypes) {
      if (type.expense_type_id === id) {
        return this.props.t(`expense:${type.expense_translation_key}`);
      }
    }
    return 'TYPE_NOT_FOUND';
  }

  render() {
    const columns = [
      {
        id: 'type',
        Header: 'Type',
        accessor: (d) => d.type,
        minWidth: 80,
        Footer: <div>Total</div>,
      },
      {
        id: 'amount',
        Header: 'Amount',
        accessor: (d) => d.amount,
        minWidth: 75,
        Footer: <div>{'$' + this.state.totalExpense}</div>,
      },
    ];

    const detailedColumns = [
      {
        id: 'date',
        Header: 'Date',
        accessor: (d) => d.date,
        minWidth: 80,
        Footer: <div>Subtotal</div>,
      },
      {
        id: 'type',
        Header: 'Type',
        accessor: (d) => d.type,
        minWidth: 75,
      },
      {
        id: 'amount',
        Header: 'Amount',
        accessor: (d) => d.amount,
        minWidth: 75,
        Footer: <div>{'$' + this.state.subTotal}</div>,
      },
    ];

    const { data, detailedHistory } = this.state;
    return (
      <div className={styles.otherExpensesContainer}>
        <h3>
          <strong>Other Expenses</strong>
        </h3>
        <div className={styles.topContainer}>
          <h4>
            <strong>Summary</strong>
          </h4>
        </div>
        <div className={styles.tableContainer}>
          {data.length > 0 && (
            <Table
              columns={columns}
              data={data}
              showPagination={false}
              minRows={5}
              className="-striped -highlight"
            />
          )}
          {data.length === 0 && <h4>You have no expense recorded for this year</h4>}
        </div>
        <div className={styles.topContainer}>
          <h4>
            <strong>Detailed History</strong>
          </h4>
        </div>
        <div className={styles.tableContainer}>
          {detailedHistory.length > 0 && (
            <div>
              <Table
                columns={detailedColumns}
                data={detailedHistory}
                showPagination={false}
                minRows={5}
                className="-striped -highlight"
                getTdProps={(state, rowInfo, column, instance) => {
                  return {
                    onClick: (e, handleOriginal) => {
                      if (rowInfo && rowInfo.original) {
                        this.props.dispatch(setExpenseDetailDate(rowInfo.original.expense_date));
                        history.push('expenses/expense_detail');
                      }
                      if (handleOriginal) {
                        handleOriginal();
                      }
                    },
                  };
                }}
              />
            </div>
          )}
          {detailedHistory.length === 0 && (
            <div>
              <h5>No expense found</h5>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    expenses: expenseSelector(state),
    expenseTypes: expenseTypeSelector(state),
    dateRange: dateRangeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OtherExpense);
