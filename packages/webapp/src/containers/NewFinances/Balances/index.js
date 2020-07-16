import React, {Component} from 'react';
import {connect} from 'react-redux';
import defaultStyles from "../../Finances/styles.scss";
import PageTitle from "../../../components/PageTitle";
import styles from "./styles.scss";
import Table from '../../../components/Table';
import {calcBalanceByCrop} from "../../Finances/util";
import {expenseSelector, salesSelector, shiftSelector} from "../../Finances/selectors";
import moment from "moment";


class Balances extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balanceByCrops: [],
      startDate: moment().startOf('year'),
      endDate: moment().endOf('year'),
    };
  }

  componentDidMount() {
    const {shifts, expenses, sales} = this.props;
    const calculatedBalanceByCrop = calcBalanceByCrop(shifts, sales, expenses, this.state.startDate, this.state.endDate);
    this.setState({balanceByCrops: calculatedBalanceByCrop});
  }

  render() {
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/NewFinances' title='Balances'/>
        <div>
          <div className={styles.balanceContainer}>
            <h5 className={defaultStyles.balanceTitle}><strong>Balance (By Crop)</strong></h5>
            <div className={defaultStyles.table}>
              <Table
              columns={balanceTableColumns}
              data={this.state.balanceByCrops}
              showPagination={false}
              sortByID={'value'}
              className="-striped -highlight"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

}

const balanceTableColumns = [
  {
    id: 'crop',
    Header: 'Crop',
    accessor: (e) => e.crop,
    minWidth: 70,
  },
  {
    id: 'value',
    Header: 'Dollars ($)',
    accessor: (e) => e.profit,
    minWidth: 70,
  }];

const mapStateToProps = (state) => {
  return {
    sales: salesSelector(state),
    shifts: shiftSelector(state),
    expenses: expenseSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(Balances);