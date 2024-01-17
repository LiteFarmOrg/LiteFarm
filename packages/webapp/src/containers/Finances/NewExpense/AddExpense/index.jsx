import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import { expenseTypeSelector, selectedExpenseSelector } from '../../selectors';
import history from '../../../../history';
import { addExpenses } from '../../actions';
import { userFarmSelector } from '../../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddExpense from '../../../../components/Finances/AddExpense';
import { FinancesHomeURL } from '../../../../util/siteMapConstants';

class AddExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expenseNames: {},
    };
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

    for (let { expense_type_id, expense_translation_key, farm_id, expense_name } of expenseTypes) {
      if (expense_type_id === id) {
        return farm_id
          ? expense_name
          : this.props.t(`expense:${expense_translation_key}.EXPENSE_NAME`);
      }
    }
    return 'NAME NOT FOUND';
  }

  handleSubmit(formData) {
    const { expenseDetail } = formData;
    let formattedData = [];
    let expenseTypeIds = Object.keys(expenseDetail);
    let farm_id = this.props.farm.farm_id;

    let missingText = false;
    for (let expenseTypeId of expenseTypeIds) {
      let itemsOfExpenseType = expenseDetail[expenseTypeId];

      for (let expenseItem of itemsOfExpenseType) {
        if (expenseItem.note === '') {
          missingText = true;
        } else {
          let value = parseFloat(expenseItem.value.toFixed(2));

          const [year, month, day] = expenseItem.date.split('-');
          const expenseDate = new Date(+year, +month - 1, +day).toISOString();

          formattedData.push({
            farm_id,
            note: expenseItem.note,
            value: value,
            expense_type_id: expenseTypeId,
            expense_date: expenseDate,
          });
        }
      }
    }

    if (
      !missingText &&
      formattedData.length &&
      formattedData.filter((expense) => expense.value < 0 || isNaN(expense.value)).length === 0
    ) {
      this.props.dispatch(addExpenses(formattedData));
      history.push(FinancesHomeURL);
    }
  }

  render() {
    const { expenseNames } = this.state;
    return (
      <HookFormPersistProvider>
        <PureAddExpense
          types={Object.keys(expenseNames).map((id) => ({ name: expenseNames[id], id }))}
          onGoBack={history.back}
          onSubmit={this.handleSubmit}
        />
      </HookFormPersistProvider>
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
