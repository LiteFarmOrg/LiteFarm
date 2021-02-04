import React, { Component } from 'react';
import { connect } from 'react-redux';
import insightStyles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { biodiversitySelector } from '../selectors';
import BiodiversitySpecies from '../../../components/Insights/BiodiversitySpecies';
import { withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';

class Biodiversity extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { t } = this.props;
    let biodiversityData = this.props.biodiversityData['data'] || [];
    return (
      <div className={insightStyles.insightContainer}>
        <PageTitle
          title={t("INSIGHTS.BIODIVERSITY.TITLE")}
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={t("INSIGHTS.BIODIVERSITY.TITLE")}
          rightIconBody={(<div>{t("INSIGHTS.BIODIVERSITY.INFO")}</div>)}
        />
        <div>
          <Semibold>{t("INSIGHTS.BIODIVERSITY.HEADER")}</Semibold>
        </div>
        <hr className={insightStyles.defaultLine} />
        {biodiversityData.map((curr, index) => {
          return (
            <BiodiversitySpecies
              key={'item-' + index}
              species={curr['name']}
              count={curr['count']}
              percent={curr['percentage']}
            />
          );
        })}
      </div>
    );
  }
}

// const infoBoxBody = (
//   <div>
//     Biodiversity is great for people and the planet. We count species richness from all known
//     records of biodiversity on your farm from the boundaries of your fields. You can increase your
//     biodiversity count on your farm by using the https://www.inaturalist.org/app.
//   </div>
// );

const mapStateToProps = (state) => {
  return {
    biodiversityData: biodiversitySelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Biodiversity));
