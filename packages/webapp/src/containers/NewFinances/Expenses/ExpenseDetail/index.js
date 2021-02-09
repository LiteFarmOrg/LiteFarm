import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../../components/PageTitle';
import { connect } from 'react-redux';
import defaultStyles from '../../../Finances/styles.module.scss';
import styles from './styles.module.scss';
import {
  expenseDetailDateSelector,
  expenseSelector,
  expenseTypeSelector,
} from '../../../Finances/selectors';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { deleteExpenses, setEditExpenses } from '../../../Finances/actions';
import history from '../../../../history';

class ExpenseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: null,
      expenseItems: [],
      total: 0,
      filteredExpenses: [],
    };
    this.getExpensesByDate = this.getExpensesByDate.bind(this);
    this.getExpenseType = this.getExpenseType.bind(this);
    this.deleteExpenses = this.deleteExpenses.bind(this);
    this.editExpenses = this.editExpenses.bind(this);
  }

  componentDidMount() {
    const { expense_detail_date } = this.props;
    let date = moment(expense_detail_date).format('MMM DD, YYYY');
    this.setState({
      date,
    });
    this.getExpensesByDate();
  }

  getExpensesByDate() {
    const { expense_detail_date, expenses } = this.props;
    let targetDate = moment(expense_detail_date).format('YYYY-MM-DD');
    let dict = {};
    let total = 0;
    let filteredExpenses = [];
    for (let e of expenses) {
      let expenseDate = moment(e.expense_date).format('YYYY-MM-DD');
      if (targetDate === expenseDate) {
        let id = e.expense_type_id;
        total += parseFloat(e.value);
        filteredExpenses.push(e);
        if (!dict.hasOwnProperty(id)) {
          dict[id] = {
            type_name: this.getExpenseType(id),
            items: [
              {
                note: e.note,
                value: e.value,
              },
            ],
          };
        } else {
          dict[id].items.push({
            note: e.note,
            value: e.value,
          });
        }
      }
    }

    this.setState({
      expenseItems: Object.values(dict),
      total: total.toFixed(2),
      filteredExpenses,
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

  deleteExpenses() {
    let farmIDs = [];
    const { filteredExpenses } = this.state;
    for (let f of filteredExpenses) {
      farmIDs.push(f.farm_expense_id);
    }
    if (farmIDs.length > 0) {
      this.props.dispatch(deleteExpenses(farmIDs));
      history.push('/newfinances/expenses');
    }
  }

  editExpenses() {
    const { filteredExpenses } = this.state;
    this.props.dispatch(setEditExpenses(filteredExpenses));
    history.push('edit_expense_categories');
  }

  render() {
    let dropDown = 0;
    const { date, expenseItems, total } = this.state;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/newfinances/expenses" title="Expense Detail" />
        <div className={styles.innerInfo}>
          <h4>{date}</h4>
          <DropdownButton
            style={{ background: '#EFEFEF', color: '#4D4D4D', border: 'none' }}
            title={'Action'}
            key={dropDown}
            id={`dropdown-basic-${dropDown}`}
          >
            <Dropdown.Item eventKey="0" onClick={() => this.editExpenses()}>
              Edit
            </Dropdown.Item>
            <Dropdown.Item eventKey="1" onClick={() => this.deleteExpenses()}>
              Delete
            </Dropdown.Item>
          </DropdownButton>
        </div>

        <div className={styles.itemContainer}>
          <h4>
            <strong>Expense Description</strong>
          </h4>
          <div>Cost</div>
        </div>
        {expenseItems.length > 0 &&
          expenseItems.map((e) => {
            return (
              <div key={e.type_name}>
                <div className={styles.typeNameContainer}>
                  <h4>
                    <strong>{e.type_name}</strong>
                  </h4>
                </div>
                {e.items.length > 0 &&
                  e.items.map((i) => {
                    return (
                      <div key={i.note + i.value.toString()} className={styles.itemContainer}>
                        <div>{'- ' + i.note}</div>
                        <div className={styles.greenText}>
                          {'$' + i.value.toFixed(2).toString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        <div className={styles.itemContainer}>
          <h4>
            <strong>Total</strong>
          </h4>
          <div className={styles.greenText}>{'$' + total}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    expense_detail_date: expenseDetailDateSelector(state),
    expenses: expenseSelector(state),
    expenseTypes: expenseTypeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ExpenseDetail);
