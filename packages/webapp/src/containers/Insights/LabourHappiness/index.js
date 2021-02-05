import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { labourHappinessSelector } from '../selectors';
import LabourHappinessTask from '../../../components/Insights/LabourHappinessTask';
import { withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';

class LabourHappiness extends Component {
  render() {
    const { t } = this.props;
    const dataSet = this.props.labourHappinessData.data;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title={t("INSIGHTS.LABOUR_HAPPINESS.TITLE")}
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={t("INSIGHTS.LABOUR_HAPPINESS.TITLE")}
          rightIconBody={(<div>{t("INSIGHTS.LABOUR_HAPPINESS.INFO")}</div>)}
        />
        <div>
          <Semibold>{t("INSIGHTS.LABOUR_HAPPINESS.HEADER")}</Semibold>
          <hr className={insightStyles.defaultLine} />
        </div>
        {dataSet.map((element, index) => {
          return (
            <div key={'item-' + index}>
              <LabourHappinessTask title={t(`task:${element.task}`)} rating={element.mood} />
            </div>
          );
        })}
      </div>
    );
  }
}

// const infoBoxBody = (
//   <div>
//     We estimate the impact of different tasks on labour happiness by using the satisfaction scores
//     and labour hours spent on each task from shifts.
//   </div>
// );

const mapStateToProps = (state) => {
  return {
    labourHappinessData: labourHappinessSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LabourHappiness));
