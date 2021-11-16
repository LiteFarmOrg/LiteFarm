import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../../styles.module.scss';
import styles from './styles.module.scss';
import {
  expenseTypeSelector,
  selectedEditExpenseSelector,
  expenseDetailSelector,
  expensesToEditSelector,
} from '../../selectors';
import history from '../../../../history';
import DateContainer from '../../../../components/Inputs/DateContainer';
import { Field, actions, Form, Control } from 'react-redux-form';
import footerStyles from '../../../../components/LogFooter/styles.module.scss';
import { addRemoveExpense } from '../../actions';
import { Alert } from 'react-bootstrap';
import { userFarmSelector } from '../../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../../../../components/Form/Input';

class EditAddExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      expenseDetail: {},
      expenseNames: {},
    };
    this.setDate = this.setDate.bind(this);
    this.getTypeName = this.getTypeName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.removeField = this.removeField.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(actions.setInitial('financeReducer.forms.expenseDetail'));
    const { selectedEditExpense, expenseToEdit } = this.props;
    let expenseNames = {};
    let formValue = {};
    let date;
    let counter = 0;
    for (let s of selectedEditExpense) {
      expenseNames[s] = this.getTypeName(s);
    }
    this.setState({ expenseNames });

    for (let e of expenseToEdit) {
      if (selectedEditExpense.indexOf(e.expense_type_id) > -1) {
        if (!formValue.hasOwnProperty(e.expense_type_id)) {
          if (counter === 0) {
            date = moment(e.expense_date);
            counter++;
          }
          formValue[e.expense_type_id] = [
            {
              note: e.note,
              value: e.value,
            },
          ];
        } else {
          formValue[e.expense_type_id].push({
            note: e.note,
            value: e.value,
          });
        }
      }
    }
    this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', formValue));
    this.setState({ date });
  }

  getTypeName(id) {
    const { expenseTypes } = this.props;

    for (let e of expenseTypes) {
      if (e.expense_type_id === id) {
        this.props.t(`expense:${e.expense_translation_key}`);
      }
    }
    return 'NAME NOT FOUND';
  }

  addSubExpense(key) {
    this.props.dispatch(
      actions.push(`financeReducer.forms.expenseDetail[${key}]`, {
        note: '',
        value: 0,
      }),
    );
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit() {
    const { currentExpenseDetail, expenseToEdit } = this.props;
    let data = [];
    let keys = Object.keys(currentExpenseDetail);
    let { farm_id } = this.props.farm;
    let date = this.state.date;
    for (let k of keys) {
      let values = currentExpenseDetail[k];

      for (let v of values) {
        if (v.note !== '' && !isNaN(v.value) && v.value > 0) {
          // dumb JS can't retain the Float type if done otherwise
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

    let expensesToDelete = [];
    for (let e of expenseToEdit) {
      expensesToDelete.push(e.farm_expense_id);
    }

    let addRemoveObj = {
      add: data,
      remove: expensesToDelete,
    };

    this.props.dispatch(addRemoveExpense(addRemoveObj));
    history.push('/other_expense');
  }

  removeField(key, index) {
    const { currentExpenseDetail } = this.props;
    if (index !== 0) {
      let newArray = [];
      let values = currentExpenseDetail[key];
      // can't use splice cuz error: cannot delete property '0' of [object Array]
      for (let i = 0; i < values.length; i++) {
        if (i !== index) {
          newArray.push(values[i]);
        }
      }
      // Deep copy of the read only object
      let newObj = JSON.parse(JSON.stringify(currentExpenseDetail));
      newObj[key] = newArray;
      this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', newObj));
    } else {
      let newObj = JSON.parse(JSON.stringify(currentExpenseDetail));
      let values = newObj[key];
      if (values.length === 1) {
        let { expenseNames } = this.state;
        delete newObj[key];
        delete expenseNames[key];
        this.setState({ expenseNames });
        this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', newObj));
      } else {
        let newArr = [];
        for (let i = 1; i < values.length; i++) {
          newArr.push(values[i]);
        }
        newObj[key] = newArr;
        this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', newObj));
      }
    }
  }

  render() {
    const { currentExpenseDetail } = this.props;
    const { expenseNames } = this.state;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle
          backUrl="/edit_expense_categories"
          title={this.props.t('EXPENSE.EDIT_EXPENSE.TITLE_2')}
        />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('EXPENSE.EDIT_EXPENSE.DATE_PLACEHOLDER')}
          allowPast={true}
        />
        <div>
          {Object.keys(expenseNames).map((k) => {
            return (
              <div key={k}>
                <div className={styles.expenseTitle}>{expenseNames[k]}</div>
                <Form model="financeReducer.forms">
                  <div className={styles.itemContainer}>
                    {currentExpenseDetail[k].map((key, i) => (
                      <div key={i}>
                        <Field
                          model={`.expenseDetail[${k}][${i}]`}
                          className={styles.fieldContainer}
                        >
                          <div className={styles.labelInput}>
                            <label>
                              {this.props.t('EXPENSE.ITEM')}
                              <br />
                              {this.props.t('EXPENSE.NAME')}
                            </label>
                            <Control.text
                              type="text"
                              model={`.expenseDetail[${k}][${i}].note`}
                              maxLength="25"
                            />
                          </div>
                          <div className={styles.labelInput}>
                            <label>{this.props.t('EXPENSE.VALUE')}</label>
                            <Control.text
                              type="number"
                              onKeyDown={numberOnKeyDown}
                              model={`.expenseDetail[${k}][${i}].value`}
                              min="0.01"
                              step="0.01"
                            />
                          </div>
                        </Field>
                        <div className={styles.removeButton}>
                          <button onClick={() => this.removeField(k, i)}>
                            {this.props.t('common:REMOVE')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.addContainer}>
                    <div className={styles.greenPlus}>+</div>
                    <button onClick={() => this.addSubExpense(k)}>
                      {this.props.t('EXPENSE.ADD_MORE_ITEMS')}
                    </button>
                  </div>
                </Form>
              </div>
            );
          })}
          {Object.keys(expenseNames).length === 0 && (
            <Alert variant="info">{this.props.t('EXPENSE.EDIT_EXPENSE.REMOVE_ALL')}</Alert>
          )}

          <div className={footerStyles.bottomContainer}>
            <div className={footerStyles.cancelButton} onClick={() => history.push('/finances')}>
              {this.props.t('common:CANCEL')}
            </div>
            <div className="btn btn-primary" onClick={() => this.handleSubmit()}>
              {this.props.t('common:SAVE')}
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
    selectedEditExpense: selectedEditExpenseSelector(state),
    currentExpenseDetail: expenseDetailSelector(state),
    expenseToEdit: expensesToEditSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditAddExpense));
