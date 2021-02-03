import React, { Component } from 'react';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { connect } from 'react-redux';
import { nitrogenBalanceSelector, nitrogenFrequencySelector } from '../selectors';
import NitrogenBalanceInfo from '../../../components/Insights/NitrogenBalanceInfo';
import FrequencySelectorComponent from '../../../components/Insights/FrequencySelectorComponent';
import { delFrequencyNitrogenBalance } from '../actions';
import styles from './styles.scss';
import { withTranslation } from 'react-i18next';

class NitrogenBalance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstRun: false,
      refreshDate: '',
      frequency: 0,
      rightIconShowDelete: true,
    };

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleFormatRefreshTime = this.handleFormatRefreshTime.bind(this);
    this.handleRightIconDelete = this.handleRightIconDelete.bind(this);
  }

  handleFormSubmit(futureDate, freq) {
    this.setState({ firstRun: false });
    this.setState({ rightIconShowDelete: true });
    this.setState({ refreshDate: formatFirstDate(futureDate) });
    this.setState({ frequency: freq });
  }

  handleFormatRefreshTime(nitrogenScheduleData) {
    if (nitrogenScheduleData) {
      this.setState({
        refreshDate: formatDate(nitrogenScheduleData['scheduled_at']),
      });
      this.setState({ frequency: nitrogenScheduleData['frequency'] });
    } else {
      this.setState({ firstRun: true });
      this.setState({ rightIconShowDelete: false });
    }
  }

  componentDidMount() {
    this.handleFormatRefreshTime(this.props.nitrogenFrequencyData);
  }

  handleRightIconDelete() {
    if (window.confirm('Are you sure you want to delete your Schedule?')) {
      this.props.dispatch(
        delFrequencyNitrogenBalance(this.props.nitrogenFrequencyData.nitrogen_schedule_id),
      );
      this.setState({ firstRun: true });
      this.setState({ rightIconShowDelete: false });
    }
  }

  render() {
    const nitrogenBalanceDataByField = this.props.nitrogenBalanceData['data'];
    const { t } = this.props;
    let renderedComponent;

    if (!this.state.firstRun) {
      if (Array.isArray(nitrogenBalanceDataByField) && nitrogenBalanceDataByField.length > 0) {
        renderedComponent = nitrogenBalanceDataByField.map((field, index) => {
          return <NitrogenBalanceInfo key={'item-nitrogen-' + index} field={field} />;
        });
      } else {
        renderedComponent = (
          <div>
            Your Nitrogen Balance is on a {this.state.frequency} months cycle and data will show on:{' '}
            {this.state.refreshDate}
          </div>
        );
      }
    } else {
      renderedComponent = (
        <div className={styles.newRunContainer}>
          <h4>
            {t("INSIGHTS.NITROGEN_BALANCE.FIRST_TIME")}
          </h4>
          <FrequencySelectorComponent handler={this.handleFormSubmit} />
        </div>
      );
    }

    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
            title={t("INSIGHTS.NITROGEN_BALANCE.TITLE")}
            backUrl="/Insights"
            rightIcon={true}
            rightIconTitle={`Every ${this.state.frequency} months: ${this.state.refreshDate}`}
            rightIconBody={(<div>
              <p>{t("INSIGHTS.NITROGEN_BALANCE.INFO_1")}</p>
              <p>{t("INSIGHTS.NITROGEN_BALANCE.INFO_2")}</p>
            </div>)}
            rightIconDeleteHandler={this.handleRightIconDelete}
            showDelete={this.state.rightIconShowDelete}
          />
        <div>{renderedComponent}</div>
      </div>
    );
  }
}

// const infoBoxBody = (
//   <div>
//     <p>
//       The nitrogen balance tells you if you have applied too little or too much fertilizer. It
//       relies on your harvest logs, nitrogen credits from legumes, and fertilization logs. You can
//       run the balance on your desired time interval.
//     </p>
//     <p>Click the delete button to reset your schedule.</p>
//   </div>
// );

const mapStateToProps = (state) => {
  return {
    nitrogenBalanceData: nitrogenBalanceSelector(state),
    nitrogenFrequencyData: nitrogenFrequencySelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

const formatDate = (date) => {
  const dateArray = date.split('-');
  return dateArray[0] + '-' + dateArray[1] + '-' + dateArray[2].substr(0, 2);
};

const formatFirstDate = (date) => {
  const year = date.getFullYear();
  let month = '' + (date.getMonth() + 1),
    day = '' + date.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(NitrogenBalance));
