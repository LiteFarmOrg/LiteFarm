import React, { Component } from "react";
import styles from './styles.scss';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';

// takes 4 props
// date: moment() , a moment obj
// placeholder: for the title in the box
// onDateChange: a function that accepts a date param, so you can set the date in the parent state
class DateContainer extends Component{
  constructor(props){
    super(props);
    this.state = {
      focused: false,
    };
  }

  handleDate(date){
    this.props.onDateChange(date);
  }

  render(){

    let { date, style } = this.props;
    let months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let month = months[date.month()];
    let day = date.date();
    let year = date.year();
    if (this.props.custom) {
      return (
        <div className={style}>
          <div>
            <SingleDatePicker
              date={this.props.date} // momentPropTypes.momentObj or null
              onDateChange={date => this.handleDate(date)} // PropTypes.func.isRequired
              focused={this.state.focused} // PropTypes.bool
              onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
              id="pick-date" // PropTypes.string.isRequired,
              placeholder={this.props.placeholder}
              noBorder={true}
              orientation="horizontal"
              numberOfMonths={1}
              withPortal
              isOutsideRange={() => false}
              readOnly={true}
              displayFormat={() => "YYYY-MM-DD"}
              renderMonthElement={({ month, onMonthSelect, onYearSelect }) => (
                <div style={{ display: 'flex', justifyContent: 'center',  fontSize:'16px'}}>
                  <div>
                    <select
                      value={month.month()}
                      onChange={(e) => { onMonthSelect(month, e.target.value); }}
                    >
                      {moment.months().map((label, value) => (
                        <option value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={month.year()}
                      onChange={(e) => { onYearSelect(month, e.target.value); }}
                    >
                      <option value={moment().year() - 10}>{moment().year() - 10}</option>
                      <option value={moment().year() - 9}>{moment().year() - 9}</option>
                      <option value={moment().year() - 8}>{moment().year() - 8}</option>
                      <option value={moment().year() - 7}>{moment().year() - 7}</option>
                      <option value={moment().year() - 6}>{moment().year() - 6}</option>
                      <option value={moment().year() - 5}>{moment().year() - 5}</option>
                      <option value={moment().year() - 4}>{moment().year() - 4}</option>
                      <option value={moment().year() - 3}>{moment().year() - 3}</option>
                      <option value={moment().year() - 2}>{moment().year() - 2}</option>
                      <option value={moment().year() - 1}>{moment().year() - 1}</option>
                      <option value={moment().year()}>{moment().year()}</option>
                      <option value={moment().year() + 1}>{moment().year() + 1}</option>
                      <option value={moment().year() + 2}>{moment().year() + 2}</option>
                      <option value={moment().year() + 3}>{moment().year() + 3}</option>
                      <option value={moment().year() + 4}>{moment().year() + 4}</option>
                      <option value={moment().year() + 5}>{moment().year() + 5}</option>
                      <option value={moment().year() + 6}>{moment().year() + 6}</option>
                      <option value={moment().year() + 7}>{moment().year() + 7}</option>
                      <option value={moment().year() + 8}>{moment().year() + 8}</option>
                      <option value={moment().year() + 9}>{moment().year() + 9}</option>
                      <option value={moment().year() + 10}>{moment().year() + 10}</option>
                      <option value={moment().year() + 11}>{moment().year() + 11}</option>
                      <option value={moment().year() + 12}>{moment().year() + 12}</option>
                      <option value={moment().year() + 13}>{moment().year() + 13}</option>
                      <option value={moment().year() + 14}>{moment().year() + 14}</option>
                      <option value={moment().year() + 15}>{moment().year() + 15}</option>
                    </select>
                  </div>
                </div>
              )}
            />
          </div>

        </div>
      )
    }

    return(
      <div className={styles.dateContainer}>
        <div className={styles.dateString}>
          { month + ' ' + day + ', ' + year }
        </div>
        <div className={styles.datePicker}>
          <SingleDatePicker
            date={null} // momentPropTypes.momentObj or null
            onDateChange={date => this.handleDate(date)} // PropTypes.func.isRequired
            focused={this.state.focused} // PropTypes.bool
            onFocusChange={({ focused }) => this.setState({ focused })} // PropTypes.func.isRequired
            id="pick-date" // PropTypes.string.isRequired,
            placeholder={this.props.placeholder}
            noBorder={true}
            orientation="horizontal"
            numberOfMonths={1}
            withPortal
            isOutsideRange={() => false}
            readOnly={true}
            displayFormat={() => "YYYY-MM-DD"}
            renderMonthElement={({ month, onMonthSelect, onYearSelect }) => (
              <div style={{ display: 'flex', justifyContent: 'center', fontSize:'16px'}}>
                <div>
                  <select
                    value={month.month()}
                    onChange={(e) => { onMonthSelect(month, e.target.value); }}
                  >
                    {moment.months().map((label, value) => (
                      <option value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={month.year()}
                    onChange={(e) => { onYearSelect(month, e.target.value); }}
                  >
                    <option value={moment().year() - 10}>{moment().year() - 10}</option>
                    <option value={moment().year() - 9}>{moment().year() - 9}</option>
                    <option value={moment().year() - 8}>{moment().year() - 8}</option>
                    <option value={moment().year() - 7}>{moment().year() - 7}</option>
                    <option value={moment().year() - 6}>{moment().year() - 6}</option>
                    <option value={moment().year() - 5}>{moment().year() - 5}</option>
                    <option value={moment().year() - 4}>{moment().year() - 4}</option>
                    <option value={moment().year() - 3}>{moment().year() - 3}</option>
                    <option value={moment().year() - 2}>{moment().year() - 2}</option>
                    <option value={moment().year() - 1}>{moment().year() - 1}</option>
                    <option value={moment().year()}>{moment().year()}</option>
                    <option value={moment().year() + 1}>{moment().year() + 1}</option>
                    <option value={moment().year() + 2}>{moment().year() + 2}</option>
                    <option value={moment().year() + 3}>{moment().year() + 3}</option>
                    <option value={moment().year() + 4}>{moment().year() + 4}</option>
                    <option value={moment().year() + 5}>{moment().year() + 5}</option>
                    <option value={moment().year() + 6}>{moment().year() + 6}</option>
                    <option value={moment().year() + 7}>{moment().year() + 7}</option>
                    <option value={moment().year() + 8}>{moment().year() + 8}</option>
                    <option value={moment().year() + 9}>{moment().year() + 9}</option>
                    <option value={moment().year() + 10}>{moment().year() + 10}</option>
                    <option value={moment().year() + 11}>{moment().year() + 11}</option>
                    <option value={moment().year() + 12}>{moment().year() + 12}</option>
                    <option value={moment().year() + 13}>{moment().year() + 13}</option>
                    <option value={moment().year() + 14}>{moment().year() + 14}</option>
                    <option value={moment().year() + 15}>{moment().year() + 15}</option>
                  </select>
                </div>
              </div>
            )}
          />
        </div>

      </div>
    )
  }

}

export default DateContainer;
