import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { cropsNutritionSelector } from '../selectors';
import InsightsInfoComponent from '../../../components/Insights/InsightsInfoComponent';
class PeopleFed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let dataSet = this.props.cropNutritionData.data;
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title="People Fed"
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={'People Fed'}
          rightIconBody={infoBoxBody}
        />
        <div>
          <h4>
            <b>Number of Meals</b>
          </h4>
          <hr className={insightStyles.defaultLine} />
        </div>
        <div>
          {dataSet.map((data, index) => {
            return (
              <InsightsInfoComponent
                key={'people-fed-item-' + index}
                title={data.label}
                value={data.val}
                valueLabel={'meals'}
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

const infoBoxBody = (
  <div>
    We estimate the number of potential meals provided by your farm based on sales data, and crop
    composition databases. We assume that daily requirements are divided equally across three meals
    a day.
  </div>
);

export default connect(mapStateToProps, mapDispatchToProps)(PeopleFed);
