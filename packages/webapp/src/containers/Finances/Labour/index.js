import React, {Component} from "react";
import moment from 'moment';
import PageTitle from "../../../components/PageTitle";
import connect from "react-redux/es/connect/connect";
import defaultStyles from '../styles.scss';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import styles from './styles.scss';
import Employee from './Employee';
import Crop from './Crop';
import Task from './Task';
import { shiftSelector, dateRangeSelector } from "../selectors";
import {farmSelector, cropSelector as fieldCropSelector} from "../../selector";
import {grabCurrencySymbol} from "../../../util";
import DateRangeSelector from "../../../components/Finances/DateRangeSelector";

class Labour extends Component {
  constructor(props) {
    super(props);

    let startDate, endDate;
    const {dateRange} = this.props;
    if(dateRange && dateRange.startDate && dateRange.endDate){
      startDate = moment(dateRange.startDate);
      endDate = moment(dateRange.endDate);
    }else{
      startDate = moment().startOf('year');
      endDate = moment().endOf('year');
    }

    this.state = {
      startDate,
      endDate,
      dropDownTitle: 'Employees',
      dButtonStyle: {
        background: '#fff',
        color: '#333',
        borderColor: '#fff',
        boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.2)',
        width: '100%',
      },
      sortYear: moment().year(),
    };

    this.sortBy = this.sortBy.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }


  changeDate(type, date) {
    if (type === 'start') {
      this.setState({startDate: date});
    } else if (type === 'end') {
      this.setState({endDate: date});
    } else {
      console.log("Error, type not specified")
    }
  }
  sortBy(type){
    this.setState({
      dropDownTitle: type
    })
  }

  render() {
    const i = 1;
    const {dropDownTitle, dButtonStyle} = this.state;
    const {farm} = this.props;
    const symbol = grabCurrencySymbol(farm);
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl='/Finances' title='Labour'/>
        <DateRangeSelector  changeDateMethod={this.changeDate}/>
        <div className={styles.topButtonContainer}>
          <h4>By</h4>
          <div className={styles.dropDownContainer}>
          <DropdownButton
            bsStyle={'default'}
            title={dropDownTitle}
            key={i}
            id={`dropdown-basic-${i}`}
            style={dButtonStyle}
          >
            <MenuItem eventKey="1" onClick={()=>this.sortBy('Employees')}>Employees</MenuItem>
            <MenuItem eventKey="2" onClick={()=>this.sortBy('Crops')}>Crops</MenuItem>
            <MenuItem eventKey="3" onClick={()=>this.sortBy('Tasks')}>Tasks</MenuItem>
          </DropdownButton>
          </div>
        </div>
        {
          dropDownTitle === 'Employees' &&
          <Employee currencySymbol={symbol} shifts={this.props.shifts} startDate={this.state.startDate} endDate={this.state.endDate}/>
        }
        {
          dropDownTitle === 'Crops' &&
          <Crop currencySymbol={symbol} shifts={this.props.shifts} startDate={this.state.startDate} endDate={this.state.endDate} fieldCrops={this.props.fieldCrops}/>
        }
        {
          dropDownTitle === 'Tasks' &&
          <Task currencySymbol={symbol} shifts={this.props.shifts} startDate={this.state.startDate} endDate={this.state.endDate}/>
        }
      </div>

    )
  }
}

const mapStateToProps = (state) => {
  return {
    shifts: shiftSelector(state),
    dateRange: dateRangeSelector(state),
    farm: farmSelector(state),
    fieldCrops: fieldCropSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Labour);
