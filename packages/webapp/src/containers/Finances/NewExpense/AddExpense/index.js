import React, {Component} from "react";
import moment from 'moment';
import PageTitle from "../../../../components/PageTitle";
import connect from "react-redux/es/connect/connect";
import defaultStyles from '../../styles.scss';
import styles from './styles.scss';
import {expenseTypeSelector, selectedExpenseSelector, expenseDetailSelector} from "../../selectors";
import history from "../../../../history";
import DateContainer from '../../../../components/Inputs/DateContainer';
import {Field, actions, Form, Control} from 'react-redux-form';
import footerStyles from "../../../../components/LogFooter/styles.scss";
import {addExpenses} from '../../actions'
import {grabCurrencySymbol} from "../../../../util";
import { userFarmSelector } from '../../../userFarmSlice';

class AddExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      expenseDetail: {},
      expenseNames: {},
      currencySymbol: grabCurrencySymbol(this.props.farm),
    };
    this.setDate = this.setDate.bind(this);
    this.getTypeName = this.getTypeName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.removeField = this.removeField.bind(this);
  }

  componentDidMount() {
    const {selectedExpense} = this.props;
    let expenseDetail = {};
    let expenseNames = {};
    let formValue = {};
    for (let s of selectedExpense) {
      expenseDetail[s] = [{
        note: '',
        value: 0,
      }];
      expenseNames[s] = this.getTypeName(s);
      formValue[s] = [{note: '', value: 0}];
    }
    this.setState({expenseNames, expenseDetail});

    this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', formValue));
  }

  getTypeName(id) {
    const {expenseTypes} = this.props;

    for (let e of expenseTypes) {
      if (e.expense_type_id === id) {
        return e.expense_name
      }
    }
    return 'NAME NOT FOUND';
  }

  addSubExpense(key) {
    this.props.dispatch(actions.push(`financeReducer.forms.expenseDetail[${key}]`, {note: '', value: 0}));
  }


  setDate(date) {
    this.setState({
      date: date,
    });
  }


  handleSubmit() {
    const {currentExpenseDetail} = this.props;
    let data = [];
    let keys = Object.keys(currentExpenseDetail);
    let farm_id = localStorage.getItem('farm_id');
    let date = this.state.date;
    for (let k of keys){
      let values = currentExpenseDetail[k];

      for(let v of values){
        if(v.note !== '' && !isNaN(v.value) && v.value >= 0){
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

    if(data.length < 1){
      alert('You need at least one valid item value pair.');
    }else{
      this.props.dispatch(addExpenses(data));
      history.push('/finances');
    }
  }

  removeField(key, index) {
    if (index !== 0) {
      const {currentExpenseDetail} = this.props;
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


  render() {
    const {currentExpenseDetail} = this.props;
    const {expenseNames} = this.state;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/expense_categories' title='New Expense (2 of 2)'/>
        <DateContainer date={this.state.date} onDateChange={this.setDate} placeholder="Choose a date" allowPast={true}/>
        <div>
          {Object.keys(expenseNames).map((k) => {
            return <div key={k}>
              <div className={styles.expenseTitle}>
                {expenseNames[k]}
              </div>
              <Form model="financeReducer.forms">
                <div className={styles.itemContainer}>
                  {
                    currentExpenseDetail[k].map((key, i) =>
                      <div key={i}>
                        <Field model={`.expenseDetail[${k}][${i}]`} className={styles.fieldContainer}>
                          <div className={styles.labelInput}>
                            <label>Item<br/>Name</label>
                            <Control.text type="text" model={`.expenseDetail[${k}][${i}].note`} maxLength="25"/>
                          </div>
                          <div className={styles.labelInput}>
                            <label>Value ({this.state.currencySymbol})</label>
                            <Control.text type="number" model={`.expenseDetail[${k}][${i}].value`} min="0.01" step="0.01" />
                          </div>
                        </Field>
                        {
                          i !== 0 &&
                            <div className={styles.removeButton}>
                              <button onClick={() => this.removeField(k, i)}>remove</button>
                            </div>

                        }
                      </div>)
                  }
                </div>
                <div className={styles.addContainer}>
                  <div className={styles.greenPlus}>+</div>
                  <button onClick={() => this.addSubExpense(k)}>
                    Add more items
                  </button>
                </div>
              </Form>
            </div>
          })}

          <div className={footerStyles.bottomContainer}>
            <div className={footerStyles.cancelButton} onClick={()=>history.push('/finances')}>
              Cancel
            </div>
            <div className="btn btn-primary" onClick={() => this.handleSubmit()}>Save</div>
          </div>
        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    expenseTypes: expenseTypeSelector(state),
    selectedExpense: selectedExpenseSelector(state),
    currentExpenseDetail: expenseDetailSelector(state),
    farm: userFarmSelector(state).userFarm,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddExpense);
