import React, { Component } from 'react';
import moment from 'moment';
import PageTitle from '../../../components/PageTitle';
import connect from 'react-redux/es/connect/connect';
import defaultStyles from '../styles.module.scss';
import styles from './styles.module.scss';
import Employee from './Employee';
import Task from './Task';
import { dateRangeSelector } from '../selectors';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { currentAndPlannedManagementPlansSelector } from '../../managementPlanSlice';
import { Main } from '../../../components/Typography';
import grabCurrencySymbol from '../../../util/grabCurrencySymbol';
import DropdownButton from '../../../components/Form/DropDownButton';
import { tasksSelector } from '../../taskSlice';
import { setDateRange } from '../actions';
import { dateRangeOptions } from '../../../components/DateRangeSelector/constants';
import DateRange, { SUNDAY } from '../../../util/dateRange';

class Labour extends Component {
  constructor(props) {
    super(props);
    const dateRange = new DateRange(new Date(), SUNDAY);
    const { startDate, endDate } = this.getDates(dateRange);

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
      dateRange,
    };

    this.sortBy = this.sortBy.bind(this);
  }

  sortBy(type) {
    this.setState({
      dropDownTitle: type,
    });
  }

  componentDidMount() {
    if (!this.props.dateRange?.option) {
      setDateRange({ ...this.props.dateRange, option: dateRangeOptions.YEAR_TO_DATE });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.dateRange !== prevProps.dateRange) {
      this.setState(this.getDates());
    }
  }

  getDates(dateRange = this.state.dateRange) {
    const option = this.props.dateRange?.option || dateRangeOptions.YEAR_TO_DATE;
    return option === dateRangeOptions.CUSTOM
      ? {
          startDate: this.props.dateRange?.startDate || undefined,
          endDate: this.props.dateRange?.endDate || undefined,
        }
      : dateRange.getDates(option);
  }

  render() {
    const i = 1;
    const { dropDownTitle, dButtonStyle } = this.state;
    const { farm } = this.props;
    const symbol = grabCurrencySymbol();
    const options = [
      {
        text: this.props.t('SALE.LABOUR.EMPLOYEES'),
        onClick: () => this.sortBy('EMPLOYEES'),
      },
      { text: this.props.t('SALE.LABOUR.TASKS'), onClick: () => this.sortBy('TASKS') },
    ];

    return (
      <div className={defaultStyles.financesContainer}>
        <PageTitle backUrl="/Finances" title={this.props.t('SALE.LABOUR.TITLE')} />
        <DateRangeSelector />
        <div className={styles.topButtonContainer}>
          <Main>{this.props.t('SALE.LABOUR.BY')}</Main>
          <div className={styles.dropDownContainer}>
            <DropdownButton options={options}>
              {this.props.t(`SALE.LABOUR.${dropDownTitle}`)}
            </DropdownButton>
          </div>
        </div>
        {dropDownTitle === 'EMPLOYEES' && (
          <Employee
            currencySymbol={symbol}
            tasks={this.props.tasks}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
          />
        )}
        {dropDownTitle === 'TASKS' && (
          <Task
            currencySymbol={symbol}
            tasks={this.props.tasks}
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
    tasks: tasksSelector(state),
    dateRange: dateRangeSelector(state),
    farm: userFarmSelector(state),
    managementPlans: currentAndPlannedManagementPlansSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Labour));
