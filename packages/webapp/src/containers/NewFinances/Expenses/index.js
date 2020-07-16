import React, {Component} from 'react';
import defaultStyles from '../../Finances/styles.scss';
import {connect} from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import {dateRangeSelector, expenseSelector, expenseTypeSelector, shiftSelector} from "../../Finances/selectors";
import OtherExpense from './components/OtherExpense';
import Labour from './components/Labour';
import {Button} from "react-bootstrap";
import history from "../../../history";

class Expenses extends Component {
  constructor(props) {
    super(props);
    this.state = {
      }
    };



  render() {
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/NewFinances' title='Expenses'/>
        <div>
          <div className={defaultStyles.buttonContainer}>
            <Button onClick={()=>{history.push('expenses/expense_categories')}}>Add New Expense</Button>
          </div>
          <Labour />
          <hr/>
          <OtherExpense />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    expenses: expenseSelector(state),
    expenseTypes: expenseTypeSelector(state),
    shifts: shiftSelector(state),
    dateRange: dateRangeSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Expenses);
