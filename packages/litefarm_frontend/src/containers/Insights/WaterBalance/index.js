import React, { Component } from 'react';
import insightStyles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import { connect } from 'react-redux';
import { waterBalanceScheduleSelector, waterBalanceSelector } from '../selectors';
import WaterBalanceInfo from '../../../components/Insights/WaterBalanceInfo';
import { Button } from 'react-bootstrap';
import { createWaterBalanceSchedule } from '../actions';
import styles from './styles.module.scss';
import { withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';

class WaterBalance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waterBalanceSchedule: this.props.waterBalanceSchedule,
    };
    this.createWaterBalanceSchedule = this.createWaterBalanceSchedule.bind(this);
  }

  createWaterBalanceSchedule() {
    this.props.dispatch(createWaterBalanceSchedule());
  }

  componentDidUpdate(prevProps) {
    if (prevProps.waterBalanceSchedule !== this.props.waterBalanceSchedule) {
      this.setState({ waterBalanceSchedule: this.props.waterBalanceSchedule });
    }
  }

  render() {
    const waterBalanceData = this.props.waterBalanceData['data'];
    const { t } = this.props;
    let renderedComponent;
    if (waterBalanceData.length > 0) {
      renderedComponent = waterBalanceData.map((field, index) => {
        return (
          <div key={'item-' + index}>
            <WaterBalanceInfo field={field} />
            <hr />
          </div>
        );
      });
    } else if (this.state.waterBalanceSchedule.farm_id) {
      renderedComponent = (
        <div>
          <Semibold>{t("INSIGHTS.WATER_BALANCE.NO_SCHEDULE_RUN")}</Semibold>
        </div>
      );
    } else {
      renderedComponent = (
        <div className={styles.newRunContainer}>
          <Semibold>{t("INSIGHTS.WATER_BALANCE.FIRST_TIME")}</Semibold>
          <Button onClick={this.createWaterBalanceSchedule} variant="primary">
            {t("INSIGHTS.WATER_BALANCE.REGISTER_FARM")}
          </Button>
        </div>
      );
    }

    return (
      <div>
        <div className={insightStyles.insightContainer}>
          <PageTitle
            title={t("INSIGHTS.WATER_BALANCE.TITLE")}
            backUrl="/Insights"
            rightIcon={true}
            rightIconTitle={t("INSIGHTS.WATER_BALANCE.TITLE")}
            rightIconBody={(<div>
              <p>{t("INSIGHTS.WATER_BALANCE.INFO_1")}</p>
              <p>{t("INSIGHTS.WATER_BALANCE.INFO_2")}</p>
            </div>)}
          />
          <div>{renderedComponent}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    waterBalanceData: waterBalanceSelector(state),
    waterBalanceSchedule: waterBalanceScheduleSelector(state),
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(WaterBalance));
