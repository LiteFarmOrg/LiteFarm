import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import { dateRangeSelector, expenseSelector, expenseTypeSelector } from '../selectors';
import Table from '../../../components/Table';
import { getExpense, setExpenseDetailItem } from '../actions';
import history from '../../../history';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import { BsCaretRight } from 'react-icons/bs';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';

class OtherExpense extends Component {
  constructor(props) {
    super(props);
    let startDate, endDate;
    const { dateRange } = this.props;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      startDate = moment(dateRange.startDate);
      endDate = moment(dateRange.endDate);
    } else {
      startDate = moment().startOf('year');
      endDate = moment().endOf('year');
    }

    this.state = {
      startDate,
      endDate,
      totalExpense: 0,
      subTotal: 0,
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
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    this.computeTable = this.computeTable.bind(this);
    this.getExpenseType = this.getExpenseType.bind(this);
    this.computeDetailedTable = this.computeDetailedTable.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(getExpense());
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.expenses !== prevProps.expenses) {
      this.computeTable();
      this.computeDetailedTable();
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

  computeTable() {
    const { expenses } = this.props;
    const { startDate, endDate } = this.state;
    let dict = {};

    for (let e of expenses) {
      if (
        moment(e.expense_date).isSameOrAfter(moment(startDate)) &&
        moment(e.expense_date).isSameOrBefore(moment(endDate))
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
        amount: dict[k].amount,
      });
      total += dict[k].amount;
    }
    return [data, total.toFixed(2)];
  }

  computeDetailedTable() {
    const { expenses } = this.props;
    const { startDate, endDate } = this.state;
    let detailedHistory = [];

    let subTotal = 0;

    for (let e of expenses) {
      if (
        moment(e.expense_date).isSameOrAfter(moment(startDate)) &&
        moment(e.expense_date).isSameOrBefore(moment(endDate))
      ) {
        let amount = parseFloat(e.value);
        subTotal += amount;
        detailedHistory.push({
          date: moment(e.expense_date),
          type: this.getExpenseType(e.expense_type_id),
          amount: this.state.currencySymbol + amount.toFixed(2).toString(),
          expense_date: e.expense_date,
          note: e.note,
          expense_item_id: e.farm_expense_id,
          value: amount,
        });
      }
    }
    return [detailedHistory, subTotal.toFixed(2)];
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
    const [data, totalData] = this.computeTable();
    const [detailedHistory, totalDetailed] = this.computeDetailedTable();

    const columns = [
      {
        id: 'type',
        Header: this.props.t('SALE.SUMMARY.TYPE'),
        accessor: (d) => d.type,
        minWidth: 80,
        Footer: <div>{this.props.t('SALE.SUMMARY.TOTAL')}</div>,
      },
      {
        id: 'amount',
        Header: this.props.t('SALE.SUMMARY.AMOUNT'),
        accessor: 'amount',
        minWidth: 75,
        Cell: (d) => <span>{`${this.state.currencySymbol}${d.value.toFixed(2).toString()}`}</span>,
        Footer: <div>{this.state.currencySymbol + totalData}</div>,
      },
    ];

    const detailedColumns = [
      {
        id: 'date',
        Header: this.props.t('SALE.LABOUR.TABLE.DATE'),
        Cell: (d) => <span>{moment(d.value).format('YYYY-MM-DD')}</span>,
        accessor: (d) => moment(d.date),
        minWidth: 70,
        Footer: <div>{this.props.t('SALE.SUMMARY.SUBTOTAL')}</div>,
      },
      {
        id: 'type',
        Header: this.props.t('SALE.LABOUR.TABLE.TYPE'),
        accessor: (d) => d.type,
        minWidth: 55,
      },
      {
        id: 'name',
        Header: this.props.t('common:NAME'),
        accessor: (d) => d.note,
        minWidth: 55,
      },
      {
        id: 'amount',
        Header: this.props.t('SALE.LABOUR.TABLE.AMOUNT'),
        accessor: 'value',
        Cell: (d) => <span>{`${this.state.currencySymbol}${d.value.toFixed(2).toString()}`}</span>,
        minWidth: 55,
        Footer: <div>{this.state.currencySymbol + totalDetailed}</div>,
      },
      {
        id: 'chevron',
        maxWidth: 25,
        accessor: () => <BsCaretRight />,
      },
    ];

    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/Finances" title={this.props.t('EXPENSE.OTHER_EXPENSES_TITLE')} />
        <DateRangeSelector changeDateMethod={this.changeDate} />

        <Semibold style={{ marginBottom: '16px' }}>{this.props.t('EXPENSE.SUMMARY')}</Semibold>
        <div className={styles.tableContainer} style={{ marginBottom: '16px' }}>
          {data.length > 0 && (
            <Table
              columns={columns}
              data={data}
              showPagination={true}
              pageSizeOptions={[5, 10, 20, 50]}
              defaultPageSize={5}
              minRows={5}
              className="-striped -highlight"
            />
          )}
          {data.length === 0 && <h4>{this.props.t('EXPENSE.NO_EXPENSE_YEAR')}</h4>}
        </div>
        <Semibold style={{ marginBottom: '16px' }}>
          {this.props.t('EXPENSE.DETAILED_HISTORY')}
        </Semibold>
        <div className={styles.tableContainer}>
          {detailedHistory.length > 0 && (
            <div>
              <Table
                columns={detailedColumns}
                data={detailedHistory}
                showPagination={true}
                pageSizeOptions={[5, 10, 20, 50]}
                defaultPageSize={5}
                minRows={5}
                className="-striped -highlight"
                getTdProps={(state, rowInfo, column, instance) => {
                  return {
                    onClick: (e, handleOriginal) => {
                      if (rowInfo && rowInfo.original) {
                        this.props.dispatch(setExpenseDetailItem(rowInfo.original));
                        history.push('/expense_detail');
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
              <h5>{this.props.t('EXPENSE.NO_EXPENSE')}</h5>
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
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(OtherExpense));
