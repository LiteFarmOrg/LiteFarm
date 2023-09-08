import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import { expenseSelector, expenseToDetailSelector, allExpenseTypeSelector } from '../selectors';
import { tempDeleteExpense, tempSetEditExpense } from '../actions';
import history from '../../../history';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import DropdownButton from '../../../components/Form/DropDownButton';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';

class ExpenseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: null,
      expenseItems: [],
      total: 0,
      filteredExpenses: [],
      currencySymbol: '$',
      showModal: false, // for confirming deleting all expenses
    };
    this.getExpensesByDate = this.getExpensesByDate.bind(this);
    this.getExpenseType = this.getExpenseType.bind(this);
    // this.editExpenses = this.editExpenses.bind(this);
    this.editExpense = this.editExpense.bind(this);
  }

  componentDidMount() {
    const { farm, expense } = this.props;
    this.setState({ currencySymbol: grabCurrencySymbol() });
    const language = getLanguageFromLocalStorage();
    const date = moment(expense.expense_date).locale(language).format('MMM DD, YYYY');
    this.setState({
      date,
    });
    this.getExpensesByDate();
  }

  getExpensesByDate() {
    const { expenses, expense } = this.props;
    let targetDate = moment(expense.expense_date).format('YYYY-MM-DD');
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

  handleDeleteExpenses = () => {
    this.setState({ showModal: true });
  };

  // TODO: replace when expense items are split by expense
  deleteExpense = () => {
    const { expense } = this.props;
    this.props.dispatch(tempDeleteExpense(expense.expense_item_id));
  };
  // deleteExpenses = () => {
  //   // eslint-disable-next-line
  //   let farmIDs = [];
  //   const { filteredExpenses } = this.state;
  //   for (let f of filteredExpenses) {
  //     farmIDs.push(f.farm_expense_id);
  //   }
  //   if (farmIDs.length > 0) {
  //     this.props.dispatch(deleteExpenses(farmIDs));
  //     history.push('/other_expense');
  //   }
  // };

  //TODO remove edit expense related functions
  editExpense() {
    // editExpenses() {
    // TODO: use the commented out code for when expense items are split by expense
    // const { filteredExpenses } = this.state;
    // this.props.dispatch(setEditExpenses(filteredExpenses));
    // history.push('/edit_expense_categories');

    // temporary implementation to edit expense items separately
    const { expense } = this.props;
    this.props.dispatch(tempSetEditExpense(expense));
    history.push('/edit_expense');
  }

  render() {
    const { date, expenseItems, total } = this.state;
    const { expense } = this.props;
    const dropDown = 0;
    const options = [
      {
        text: this.props.t('common:EDIT'),
        onClick: () => this.editExpense(),
      },
      { text: this.props.t('common:DELETE'), onClick: () => this.handleDeleteExpenses() },
    ];

    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/other_expense" title={this.props.t('SALE.EXPENSE_DETAIL.TITLE')} />
        <div className={styles.innerInfo}>
          <h4>{date}</h4>
          <DropdownButton options={options}>
            {this.props.t('SALE.EXPENSE_DETAIL.ACTION')}
          </DropdownButton>
        </div>

        <div className={styles.itemContainer}>
          <Semibold>{this.props.t('SALE.EXPENSE_DETAIL.DESCRIPTION')}</Semibold>
          <div>{this.props.t('SALE.EXPENSE_DETAIL.COST')}</div>
        </div>
        {/* {expenseItems.length > 0 &&
          expenseItems.map((e) => {
            return (
              <div key={e.type_name}>
                <div className={styles.typeNameContainer}>
                  <Semibold>{e.type_name}</Semibold>
                </div>
                {e.items.length > 0 &&
                  e.items.map((i) => {
                    return (
                      <div key={i.note + i.value.toString()} className={styles.itemContainer}>
                        <div>{'- ' + i.note}</div>
                        <div className={styles.greenText}>
                          {this.state.currencySymbol + i.value.toFixed(2).toString()}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })} */}
        <div key={expense.type}>
          <div className={styles.typeNameContainer}>
            <Semibold>{expense.type}</Semibold>
          </div>
          <div key={expense.note + expense.amount.toString()} className={styles.itemContainer}>
            <div style={{ overflowWrap: 'anywhere' }}>{'- ' + expense.note}</div>
            <div className={styles.greenText}>{expense.amount}</div>
          </div>
        </div>
        {/* <div className={styles.itemContainer}>
          <Semibold>{this.props.t('SALE.EXPENSE_DETAIL.TOTAL')}</Semibold>
          <div className={styles.greenText} id="total-amount">
            {this.state.currencySymbol + total}
          </div>
        </div> */}
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {
            this.deleteExpense();
            this.setState({ showModal: false });
          }}
          message={this.props.t('SALE.EXPENSE_DETAIL.TEMP_DELETE_CONFIRMATION')}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    // expense_detail_date: expenseDetailDateSelector(state),
    expenses: expenseSelector(state),
    expenseTypes: allExpenseTypeSelector(state),
    farm: userFarmSelector(state),
    expense: expenseToDetailSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ExpenseDetail));
