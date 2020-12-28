import React, { Component } from 'react';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { connect } from 'react-redux';
import { waterBalanceScheduleSelector, waterBalanceSelector } from '../selectors';
import WaterBalanceInfo from '../../../components/Insights/WaterBalanceInfo';
import { Button } from 'react-bootstrap';
import { createWaterBalanceSchedule } from '../actions';
import styles from './styles.scss';

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
          <h4>
            Your scheduled water balance hasn't run yet, please check back in two days and ensure
            you have at least one soil analysis that records soil texture for a field to see water
            balance data for crops in that field. If the problem persists please contact LiteFarm.
          </h4>
        </div>
      );
    } else {
      renderedComponent = (
        <div className={styles.newRunContainer}>
          <h4>
            Looks like this is your first time running this! For more info on what this does, please
            click the information button to see.
          </h4>
          <Button onClick={this.createWaterBalanceSchedule} variant="primary">
            Register Farm
          </Button>
        </div>
      );
    }

    return (
      <div>
        <div className={insightStyles.insightContainer}>
          <PageTitle
            title="Water Balance"
            backUrl="/Insights"
            rightIcon={true}
            rightIconTitle={'Water Balance'}
            rightIconBody={infoBoxBody}
          />
          <div>{renderedComponent}</div>
        </div>
      </div>
    );
  }
}

const infoBoxBody = (
  <div>
    <p>
      The water balance tells you whether your crops have too little or too much water. It relies on
      weather data, and it is updated by your irrigation and soil texture data from your soil
      analysis logs.
    </p>
    <p>
      This feature has not been widely tested across farms with low surrounding weather station
      density so use with caution. We welcome feedback on how well it performs for your farm.
    </p>
  </div>
);
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

export default connect(mapStateToProps, mapDispatchToProps)(WaterBalance);
