import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.scss';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import styles from './styles.scss';
import Employee from './Employee';
import Crop from './Crop';
import Task from './Task';
import { dateRangeSelector, shiftSelector } from '../selectors';
import { grabCurrencySymbol } from '../../../util';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { Main } from '../../../components/Typography';

class Labour extends Component {
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
      dropDownTitle: 'EMPLOYEES',
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
      this.setState({ startDate: date });
    } else if (type === 'end') {
      this.setState({ endDate: date });
    } else {
      console.log('Error, type not specified');
    }
  }
  sortBy(type) {
    this.setState({
      dropDownTitle: type,
    });
  }

  render() {
    const i = 1;
    const { dropDownTitle, dButtonStyle } = this.state;
    const { farm } = this.props;
    const symbol = grabCurrencySymbol(farm);
    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/Finances" title={this.props.t('SALE.LABOUR.TITLE')} />
        <DateRangeSelector changeDateMethod={this.changeDate} />
        <div className={styles.topButtonContainer}>
          <Main>{this.props.t('SALE.LABOUR.BY')}</Main>
          <div className={styles.dropDownContainer}>
            <DropdownButton
              variant={'default'}
              title={this.props.t(`SALE.LABOUR.${dropDownTitle}`)}
              key={i}
              id={`dropdown-basic-${i}`}
            >
              <Dropdown.Item eventKey="1" onClick={() => this.sortBy('EMPLOYEES')}>
                {this.props.t('SALE.LABOUR.EMPLOYEES')}
              </Dropdown.Item>
              <Dropdown.Item eventKey="2" onClick={() => this.sortBy('CROPS')}>
                {this.props.t('SALE.LABOUR.CROPS')}
              </Dropdown.Item>
              <Dropdown.Item eventKey="3" onClick={() => this.sortBy('TASKS')}>
                {this.props.t('SALE.LABOUR.TASKS')}
              </Dropdown.Item>
            </DropdownButton>
          </div>
        </div>
        {dropDownTitle === 'EMPLOYEES' && (
          <Employee
            currencySymbol={symbol}
            shifts={this.props.shifts}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
          />
        )}
        {dropDownTitle === 'CROPS' && (
          <Crop
            currencySymbol={symbol}
            shifts={this.props.shifts}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            fieldCrops={this.props.fieldCrops}
          />
        )}
        {dropDownTitle === 'TASKS' && (
          <Task
            currencySymbol={symbol}
            shifts={this.props.shifts}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
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
    farm: userFarmSelector(state),
    fieldCrops: currentFieldCropsSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Labour));
