import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../../styles.module.scss';
import styles from './styles.module.scss';
import { expenseTypeSelector, selectedExpenseSelector } from '../../selectors';
import history from '../../../../history';
import DateContainer from '../../../../components/Inputs/DateContainer';
import ExpenseItemsForTypes from '../../../../components/Finances/ExpenseItemsForTypes';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import footerStyles from '../../../../components/LogFooter/styles.module.scss';
import { addExpenses } from '../../actions';
import { userFarmSelector } from '../../../userFarmSlice';
import { withTranslation } from 'react-i18next';

class AddExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      expenseDetail: {},
      expenseNames: {},
      isValid: {},
    };
    this.setDate = this.setDate.bind(this);
    this.getTypeName = this.getTypeName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const { selectedExpense } = this.props;
    const expenseNames = {};
    for (let s of selectedExpense) {
      expenseNames[s] = this.getTypeName(s);
    }
    this.setState({ expenseNames });
  }

  getTypeName(id) {
    const { expenseTypes } = this.props;

    for (let e of expenseTypes) {
      if (e.expense_type_id === id) {
        return this.props.t(`expense:${e.expense_translation_key}`);
      }
    }
    return 'NAME NOT FOUND';
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit() {
    const { expenseDetail } = this.state;
    let data = [];
    let keys = Object.keys(expenseDetail);
    let farm_id = this.props.farm.farm_id;
    let date = this.state.date;
    let missingText = false;
    for (let k of keys) {
      let values = expenseDetail[k];

      for (let v of values) {
        if (v.note === '') {
          missingText = true;
        } else {
          let value = parseFloat(parseFloat(v.value).toFixed(2));
          let temp = {
            farm_id,
            note: v.note,
            value: value,
            expense_type_id: k,
            expense_date: date,
          };
          data.push(temp);
        }
      }
    }

    if (
      !missingText &&
      data.length &&
      data.filter((d) => d.value <= 0 || isNaN(d.value)).length === 0
    ) {
      this.props.dispatch(addExpenses(data));
      history.push('/finances');
    }
  }

  render() {
    const { expenseNames } = this.state;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle
          backUrl="/expense_categories"
          title={this.props.t('EXPENSE.ADD_EXPENSE.TITLE_2')}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('EXPENSE.EDIT_EXPENSE.DATE_PLACEHOLDER')}
          allowPast={true}
        />
        <div>
          <HookFormPersistProvider>
            <ExpenseItemsForTypes
              types={Object.keys(expenseNames).map((id) => ({ name: expenseNames[id], id }))}
              setExpenses={(data) => this.setState({ expenseDetail: data })}
              setIsValid={(isValid) => this.setState({ isValid })}
            />
          </HookFormPersistProvider>
        </div>
        <div>
          <div className={footerStyles.bottomContainer}>
            <div className={footerStyles.cancelButton} onClick={() => history.push('/finances')}>
              {this.props.t('common:CANCEL')}
            </div>
            <div className="btn btn-primary" onClick={() => this.handleSubmit()}>
              {this.state.isValid ? this.props.t('common:SAVE') : 'ERROR'}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    expenseTypes: expenseTypeSelector(state),
    selectedExpense: selectedExpenseSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AddExpense));
