import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { cropsNutritionSelector } from '../selectors';
import InsightsInfoComponent from '../../../components/Insights/InsightsInfoComponent';
import { withTranslation } from 'react-i18next';

class PeopleFed extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.i18nNutritionDict = {
      "Calories": props.t("INSIGHTS.PEOPLE_FED.CALORIES"),
      "Protein": props.t("INSIGHTS.PEOPLE_FED.PROTEIN"),
      "Fat": props.t("INSIGHTS.PEOPLE_FED.FAT"),
      "Vitamin C": props.t("INSIGHTS.PEOPLE_FED.VITAMIN_C"),
      "Vitamin A": props.t("INSIGHTS.PEOPLE_FED.VITAMIN_A"),
    };
  }

  render() {
    const { t } = this.props;
    let dataSet = this.props.cropNutritionData.data;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title={t("INSIGHTS.PEOPLE_FED.TITLE")}
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={t("INSIGHTS.PEOPLE_FED.TITLE")}
          rightIconBody={(<div>{t("INSIGHTS.PEOPLE_FED.INFO")}</div>)}
        />
        <div>
          <h4>
            <b>{t("INSIGHTS.PEOPLE_FED.HEADER")}</b>
          </h4>
          <hr className={insightStyles.defaultLine} />
        </div>
        <div>
          {dataSet.map((data, index) => {
            return (
              <InsightsInfoComponent
                key={'people-fed-item-' + index}
                title={this.i18nNutritionDict[data.label]}
                value={data.val}
                valueLabel={t("INSIGHTS.PEOPLE_FED.MEALS")}
                percent={data.percentage}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    cropNutritionData: cropsNutritionSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PeopleFed));
