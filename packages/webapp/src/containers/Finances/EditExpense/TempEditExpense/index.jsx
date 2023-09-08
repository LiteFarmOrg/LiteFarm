import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../../styles.module.scss';
import styles from './styles.module.scss';
import {
  expenseDetailSelector,
  allExpenseTypeSelector,
  selectedEditExpenseSelector,
  tempExpenseToEditSelector,
} from '../../selectors';
import history from '../../../../history';
import DateContainer from '../../../../components/Inputs/DateContainer';
import { actions, Control, Field, Form } from 'react-redux-form';
import footerStyles from '../../../../components/LogFooter/styles.module.scss';
import { tempEditExpense } from '../../actions';
import { userFarmSelector } from '../../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { numberOnKeyDown } from '../../../../components/Form/Input';

class TempEditExpense extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
      expenseDetail: {},
      expenseNames: {},
    };
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(actions.setInitial('financeReducer.forms.expenseDetail'));
    const { expenseToEdit } = this.props;
    let formValue = {};
    formValue.note = expenseToEdit.note;
    formValue.value = expenseToEdit.value;

    this.props.dispatch(actions.change('financeReducer.forms.expenseDetail', formValue));
    this.setState({ date: moment(expenseToEdit.expense_date) });
  }

  setDate(date) {
    this.setState({
      date,
    });
  }

  handleSubmit() {
    const { currentExpenseDetail, expenseToEdit } = this.props;
    let { date } = this.state;

    let data = {
      expense_date: date,
      note: currentExpenseDetail.note,
      value: parseFloat(parseFloat(currentExpenseDetail.value).toFixed(2)),
    };

    this.props.dispatch(tempEditExpense(expenseToEdit.expense_item_id, data));
    history.push('/other_expense');
  }

  render() {
    const { expenseToEdit } = this.props;
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/expense_detail" title={this.props.t('EXPENSE.EDIT_EXPENSE.TITLE_2')} />
        <DateContainer
          date={this.state.date}
          onDateChange={this.setDate}
          placeholder={this.props.t('EXPENSE.EDIT_EXPENSE.DATE_PLACEHOLDER')}
          allowPast={true}
        />
        <div>
          <div className={styles.expenseTitle}>{expenseToEdit.type}</div>
          <Form model="financeReducer.forms">
            <div className={styles.itemContainer}>
              <div>
                <Field model={`.expenseDetail`} className={styles.fieldContainer}>
                  <div className={styles.labelInput}>
                    <label>
                      {this.props.t('EXPENSE.ITEM')}
                      <br />
                      {this.props.t('EXPENSE.NAME')}
                    </label>
                    <Control.textarea
                      type="text"
                      model={`.expenseDetail.note`}
                      maxLength="100"
                      rows={3}
                    />
                  </div>
                  <div className={styles.labelInput}>
                    <label>{this.props.t('EXPENSE.VALUE')}</label>
                    <Control.text
                      type="number"
                      onKeyDown={numberOnKeyDown}
                      model={`.expenseDetail.value`}
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </Form>
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
    expenseTypes: allExpenseTypeSelector(state),
    selectedEditExpense: selectedEditExpenseSelector(state),
    currentExpenseDetail: expenseDetailSelector(state),
    expenseToEdit: tempExpenseToEditSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TempEditExpense));
