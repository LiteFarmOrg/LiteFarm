import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle';
class Erosion extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title="Erosion"
          backUrl="/Insights"
          rightIcon={true}
          rightIconBody={infoBoxBody}
          rightIconTitle={'Soil Erosion'}
        />
        <div>Hello World!</div>
      </div>
    );
  }
}

const infoBoxBody = (
  <div>
    Reducing erosion is great way to keep your soil healthy for future generations. You can find out
    how to reduce soil erosion here: www.usefullink.com
  </div>
);

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapDispatchToProps)(Erosion);
