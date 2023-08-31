import React, { Component } from 'react';
import connect from 'react-redux/es/connect/connect';
import { expenseTypeSelector, selectedExpenseSelector } from '../../selectors';
import history from '../../../../history';
import { addExpenses } from '../../actions';
import { userFarmSelector } from '../../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureAddExpense from '../../../../components/Finances/AddExpense';

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

    for (let e of expenseTypes) {
      if (e.expense_type_id === id) {
        return this.props.t(`expense:${e.expense_translation_key}`);
      }
    }
    return 'NAME NOT FOUND';
  }

  handleSubmit(formData) {
    const { expenseDetail, date } = formData;
    let data = [];
    let keys = Object.keys(expenseDetail);
    let farm_id = this.props.farm.farm_id;
    const [year, month, day] = date.split('-');
    const expenseDate = new Date(+year, +month - 1, +day).toISOString();

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
            expense_date: expenseDate,
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
