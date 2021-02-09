import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import defaultStyles from '../../styles.scss';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import styles from './styles.scss';
import Employee from './Employee';
import Crop from './Crop';
import Task from './Task';
import { shiftSelector, dateRangeSelector } from '../../../../Finances/selectors';

class Labour extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: moment(),
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
  }

  componentDidMount() {}

  sortBy(type) {
    this.setState({
      dropDownTitle: type,
    });
  }

  render() {
    const i = 1;
    const { dropDownTitle, dButtonStyle } = this.state;
    const { dateRange } = this.props;
    return (
      <div className={defaultStyles.labourContainer}>
        <h3>
          <strong>Labour Expenses</strong>
        </h3>
        <div className={styles.topButtonContainer}>
          <h4>By</h4>
          <div className={styles.dropDownContainer}>
            <DropdownButton
              variant={'default'}
              title={dropDownTitle}
              key={i}
              id={`dropdown-basic-${i}`}
              style={dButtonStyle}
            >
              <Dropdown.Item eventKey="1" onClick={() => this.sortBy('Employees')}>
                Employees
              </Dropdown.Item>
              <Dropdown.Item eventKey="2" onClick={() => this.sortBy('Crops')}>
                Crops
              </Dropdown.Item>
              <Dropdown.Item eventKey="3" onClick={() => this.sortBy('Tasks')}>
                Tasks
              </Dropdown.Item>
            </DropdownButton>
          </div>
        </div>
        {dropDownTitle === 'Employees' && (
          <Employee
            shifts={this.props.shifts}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        )}
        {dropDownTitle === 'Crops' && (
          <Crop
            shifts={this.props.shifts}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        )}
        {dropDownTitle === 'Tasks' && (
          <Task
            shifts={this.props.shifts}
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    shifts: shiftSelector(state),
    dateRange: dateRangeSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Labour);
