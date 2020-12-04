import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { labourHappinessSelector } from '../selectors';
import LabourHappinessTask from '../../../components/Insights/LabourHappinessTask';

class LabourHappiness extends Component {
  render() {
    const dataSet = this.props.labourHappinessData.data;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title="Labour Happiness"
          backUrl="/Insights"
          rightIcon={true}
          rightIconBody={infoBoxBody}
          rightIconTitle={'Labour Happiness'}
        />
        <div>
          <h4>
            <b>Tasks</b>
          </h4>
          <hr className={insightStyles.defaultLine} />
        </div>
        {dataSet.map((element, index) => {
          return (
            <div key={'item-' + index}>
              <LabourHappinessTask title={element.task} rating={element.mood} />
            </div>
          );
        })}
      </div>
    );
  }
}

const infoBoxBody = (
  <div>
    We estimate the impact of different tasks on labour happiness by using the satisfaction scores
    and labour hours spent on each task from shifts.
  </div>
);

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

export default connect(mapStateToProps, mapDispatchToProps)(LabourHappiness);
