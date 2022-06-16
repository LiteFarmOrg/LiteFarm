import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import { FromToDateContainer } from '../../../components/Inputs/DateContainer';
import { setDateRange } from '../../../containers/Finances/actions';
import moment from 'moment';
import InfoBoxComponent from '../../InfoBoxComponent';
import { dateRangeSelector } from '../../../containers/Finances/selectors';
import { Semibold } from '../../Typography';
import { withTranslation } from 'react-i18next';

class DateRangeSelector extends Component {
  constructor(props) {
    super(props);
    let startDate, endDate, validRange;
    const { dateRange } = this.props;
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      startDate = moment(dateRange.startDate);
      endDate = moment(dateRange.endDate);
    } else {
      startDate = moment().startOf('year');
      endDate = moment().endOf('year');
    }
    startDate <= endDate ? (validRange = true) : (validRange = false);

    this.state = {
      startDate,
      endDate,
      validRange,
    };
    this.changeStartDate.bind(this);
    this.changeEndDate.bind(this);
  }

  changeStartDate = (date) => {
    if (date > this.state.endDate) {
      this.setState({ validRange: false });
      return;
    }
    this.setState({ validRange: true });
    this.setState({ startDate: date });
    const endDate = this.state.endDate;
    this.props.dispatch(setDateRange({ startDate: date, endDate }));
    this.props.changeDateMethod('start', date);
  };

  changeEndDate = (date) => {
    if (date < this.state.startDate) {
      this.setState({ validRange: false });
      return;
    }
    this.setState({ validRange: true });
    this.setState({ endDate: date });
    const startDate = this.state.startDate;
    this.props.dispatch(setDateRange({ startDate, endDate: date }));
    this.props.changeDateMethod('end', date);
  };

  render() {
    const { hideTooltip } = this.props;
    const changeDateToParent = this.props.changeDateMethod;

    return (
      <div className={styles.rangeContainer}>
        <div className={styles.titleContainer}>
          <Semibold style={{ textAlign: 'left', marginBottom: '20px' }}>
            {this.props.t('DATE_RANGE.TITLE')}
          </Semibold>
          {!hideTooltip && (
            <InfoBoxComponent
              customStyle={{ float: 'right' }}
              title={this.props.t('DATE_RANGE.HELP_TITLE')}
              body={this.props.t('DATE_RANGE.HELP_BODY')}
            />
          )}
        </div>

        <FromToDateContainer
          onStartDateChange={this.changeStartDate}
          onEndDateChange={this.changeEndDate}
          endDate={this.state.endDate}
          startDate={this.state.startDate}
        />
        {!this.state.validRange && (
          <Semibold style={{ textAlign: 'center', color: 'red' }}>
            {this.props.t('DATE_RANGE.INVALID_RANGE_MESSAGE')}
          </Semibold>
        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DateRangeSelector));
