import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { soilOMSelector } from '../selectors';
import InsightsInfoComponent from '../../../components/Insights/InsightsInfoComponent';
import { withTranslation } from 'react-i18next';

class SoilOM extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title="Soil OM Content"
          backUrl="/Insights"
          rightIcon={true}
          rightIconBody={infoBoxBody}
          rightIconTitle={'Soil OM'}
        />
        <div>
          <h4>
            <b>Soil Organic Matter</b>
          </h4>
          <hr className={insightStyles.defaultLine} />
        </div>
        <div>
          {this.props.soilOMData.data.map((element, index) => {
            return (
              <div key={'item-' + index}>
                <InsightsInfoComponent
                  title={element.field_name}
                  valueLabel={'%'}
                  value={element.soil_om}
                  percent={element.percentage}
                />
                <hr />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const infoBoxBody = (
  <div>
    Soil Organic Matter is needed to maintain a healthy soil environment for your crop. We populate
    these data from your most recent soil analysis logs. If you do not have any data we predict the
    potential soil organic matter for your location globally.
  </div>
);

const mapStateToProps = (state) => {
  return {
    soilOMData: soilOMSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SoilOM));
