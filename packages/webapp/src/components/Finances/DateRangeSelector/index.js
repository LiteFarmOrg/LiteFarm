import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';
import DateContainer from '../../../components/Inputs/DateContainer';
import { setDateRange } from '../../../containers/Finances/actions';
import moment from 'moment';
import InfoBoxComponent from '../../InfoBoxComponent';
import { dateRangeSelector } from '../../../containers/Finances/selectors';
import { Main } from '../../Typography';

class DateRangeSelector extends Component {
  constructor(props) {
    super(props);
    let startDate, endDate;
    const { dateRange } = this.props;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      startDate = moment(dateRange.startDate);
      endDate = moment(dateRange.endDate);
    } else {
      startDate = moment().startOf('year');
      endDate = moment().endOf('year');
    }

    this.state = {
      startDate,
      endDate,
    };
    this.changeStartDate.bind(this);
    this.changeEndDate.bind(this);
  }

  changeStartDate = (date, parentMethod) => {
    this.setState({ startDate: date });
    const endDate = this.state.endDate;
    this.props.dispatch(setDateRange({ startDate: date, endDate }));
    parentMethod('start', date);
  };

  changeEndDate = (date, parentMethod) => {
    this.setState({ endDate: date });
    const startDate = this.state.startDate;
    this.props.dispatch(setDateRange({ startDate, endDate: date }));
    parentMethod('end', date);
  };

  render() {
    const { hideTooltip } = this.props;
    const changeDateToParent = this.props.changeDateMethod;

    return (
      <div className={styles.rangeContainer}>
        {!hideTooltip && (
          <InfoBoxComponent
            customStyle={{ float: 'right' }}
            title={'Date Range Help'}
            body={
              'Select the date range to create a financial report for your farm for a given time window.'
            }
          />
        )}
        <Main style={{ textAlign: 'center', marginBottom: '20px' }}>Filter Report by Date</Main>
        <div className={styles.toFromContainer}>
          <span className={styles.pullLeft}>
            <label>From</label>
            <DateContainer
              style={styles.date}
              custom={true}
              date={this.state.startDate}
              onDateChange={(date) => this.changeStartDate(date, changeDateToParent)}
            />
          </span>
          <span className={styles.pullRight}>
            <label>To</label>
            <DateContainer
              style={styles.date}
              custom={true}
              date={this.state.endDate}
              onDateChange={(date) => this.changeEndDate(date, changeDateToParent)}
            />
          </span>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

const mapStateToProps = (state) => {
  return {
    dateRange: dateRangeSelector(state),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DateRangeSelector);
