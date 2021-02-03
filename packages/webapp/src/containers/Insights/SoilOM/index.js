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
    const { t } = this.props;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title={t("INSIGHTS.SOIL_OM.ALTERNATE_TITLE")}
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={t("INSIGHTS.SOIL_OM.TITLE")}
          rightIconBody={(<div>{t("INSIGHTS.SOIL_OM.INFO")}</div>)}
        />
        <div>
          <h4>
            <b>{t("INSIGHTS.SOIL_OM.HEADER")}</b>
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

// const infoBoxBody = (
//   <div>
//     Soil Organic Matter is needed to maintain a healthy soil environment for your crop. We populate
//     these data from your most recent soil analysis logs. If you do not have any data we predict the
//     potential soil organic matter for your location globally.
//   </div>
// );

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
