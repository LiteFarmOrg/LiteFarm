import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../../styles.module.scss';
import { AddLink, Semibold } from '../../../../components/Typography';
import styles from './styles.module.scss';
import {
  expenseDetailSelector,
  expenseTypeSelector,
  selectedExpenseSelector,
} from '../../selectors';
import history from '../../../../history';
import DateContainer from '../../../../components/Inputs/DateContainer';
import { actions, Control, Field, Form, Errors } from 'react-redux-form';
import footerStyles from '../../../../components/LogFooter/styles.module.scss';
import { addExpenses } from '../../actions';
import { userFarmSelector } from '../../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../../../../components/Form/Input';
import grabCurrencySymbol from '../../../../util/grabCurrencySymbol';

class AddExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      expenseDetail: {},
      expenseNames: {},
      currencySymbol: grabCurrencySymbol(),
    };
    this.setDate = this.setDate.bind(this);
    this.getTypeName = this.getTypeName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.removeField = this.removeField.bind(this);
    this.min = this.min.bind(this);
    this.required = this.required.bind(this);
  }

  componentDidMount() {
    const { selectedExpense } = this.props;
    let expenseDetail = {};
    let expenseNames = {};
    let formValue = {};
    for (let s of selectedExpense) {
      expenseDetail[s] = [
        {
          note: '',
          value: undefined,
        },
      ];
      expenseNames[s] = this.getTypeName(s);
      formValue[s] = [{ note: '', value: undefined }];
    }
    this.setState({ expenseNames, expenseDetail });

    this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', formValue));
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

  addSubExpense(key) {
    this.props.dispatch(
      actions.push(`financeReducer.forms.expenseDetail[${key}]`, {
        note: '',
        value: undefined,
      }),
    );
  }

  setDate(date) {
    this.setState({
      date: date,
    });
  }

  handleSubmit() {
    const { currentExpenseDetail } = this.props;
    let data = [];
    let keys = Object.keys(currentExpenseDetail);
    let farm_id = this.props.farm.farm_id;
    let date = this.state.date;
    let missingText = false;
    for (let k of keys) {
      let values = currentExpenseDetail[k];

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

    // if (data.length < 1) {
    // alert(this.props.t('EXPENSE.ADD_EXPENSE.REQUIRED_ERROR'));
    if (
      !missingText &&
      data.length &&
      data.filter((d) => d.value <= 0 || isNaN(d.value)).length === 0
    ) {
      this.props.dispatch(addExpenses(data));
      history.push('/finances');
    }
  }

  removeField(key, index) {
    if (index !== 0) {
      const { currentExpenseDetail } = this.props;
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
    }
  }

  required(value) {
    return value ? undefined : this.props.t('EXPENSE.ADD_EXPENSE.REQUIRED_ERROR');
  }
  min(value) {
    return !isNaN(value) && value >= 0
      ? undefined
      : this.props.t('EXPENSE.ADD_EXPENSE.MIN_ERROR') + '0';
  }

  render() {
    const { currentExpenseDetail } = this.props;
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
                            <Control.textarea
                              type="text"
                              model={`.expenseDetail[${k}][${i}].note`}
                              maxLength="100"
                              rows={3}
                            />
                          </div>

                          <div className={styles.labelInput}>
                            <label>
                              {this.props.t('EXPENSE.VALUE')} ({this.state.currencySymbol})
                            </label>
                            <Control.text
                              type="number"
                              onKeyDown={numberOnKeyDown}
                              model={`.expenseDetail[${k}][${i}].value`}
                              validators={{ min: (val) => val > 0 }}
                              min="0.01"
                              step="0.01"
                            />
                          </div>
                          <Errors
                            className="required"
                            model={`.expenseDetail[${k}][${i}].value`}
                            show={{ touched: true, focus: false }}
                            messages={{
                              min: this.props.t('EXPENSE.ADD_EXPENSE.MIN_ERROR') + '0',
                            }}
                          />
                        </Field>
                        {i !== 0 && (
                          <div className={styles.removeButton}>
                            <button onClick={() => this.removeField(k, i)}>
                              {this.props.t('common:REMOVE')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <div style={{ float: 'right' }}>
                      {this.props.t('EXPENSE.ADD_EXPENSE.ALL_FIELDS_REQUIRED')}
                    </div>
                  </div>
                  <div className={styles.addContainer}>
                    <AddLink onClick={() => this.addSubExpense(k)}>
                      {this.props.t('EXPENSE.ADD_MORE_ITEMS')}
                    </AddLink>
                  </div>
                </Form>
              </div>
            );
          })}

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
    selectedExpense: selectedExpenseSelector(state),
    currentExpenseDetail: expenseDetailSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AddExpense));
