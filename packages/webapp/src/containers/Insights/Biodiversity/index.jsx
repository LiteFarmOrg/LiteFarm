import React, { Component, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import insightStyles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import { biodiversityLoadingSelector, biodiversitySelector } from '../selectors';
import BiodiversitySpecies from '../../../components/Insights/BiodiversitySpecies';
import { useTranslation, withTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import { getBiodiversityData } from '../actions';
import BiodiversityLoadingModal from '../../../components/Modals/BiodiversityLoadingModal/BiodiversityLoadingModal';
import history from '../../../history';

const Biodiversity = () => {
  const biodiversityData = useSelector(biodiversitySelector);
  const biodiversityLoading = useSelector(biodiversityLoadingSelector);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const getMinutesSinceTime = (time) => {
    return Math.round((Date.now() - time) / (1000 * 60));
  };

  useEffect(() => {
    // if (!(biodiversityData.timeFetched && getMinutesSinceTime(biodiversityData.timeFetched) < 30)) {
    //   dispatch(getBiodiversityData());
    // }
    dispatch(getBiodiversityData());
  });

  const biodiversityInfoItems = biodiversityData.data.map((current, index) => {
    console.log(current);
    return (
      <BiodiversitySpecies
        key={`item-${index}`}
        species={current.name}
        count={current.count}
        percent={current.percent}
      />
    );
  });

  const dismissModal = () => {
    history.push('/Insights');
  };

  return (
    <div className={insightStyles.insightContainer}>
      <PageTitle
        title={t('INSIGHTS.BIODIVERSITY.TITLE')}
        backUrl={'/Insights'}
        rightIcon={true}
        rightIconTitle={t('INSIGHTS.BIODIVERSITY.TITLE')}
        rightIconBody={<div>{t('INSIGHTS.BIODIVERSITY.INFO')}</div>}
      />
      <div>
        <Semibold>{t('INSIGHTS.BIODIVERSITY.HEADER')}</Semibold>
      </div>
      <hr className={insightStyles.defaultLine} />
      {biodiversityLoading ? (
        <BiodiversityLoadingModal
          dismissModal={dismissModal}
          loadingError={true}
          minutes={getMinutesSinceTime(30 - biodiversityData.timeFetched)}
        />
      ) : (
        biodiversityInfoItems
      )}
    </div>
  );
};

class BiodiversityOld extends Component {
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
          title={t('INSIGHTS.BIODIVERSITY.TITLE')}
          backUrl="/Insights"
          rightIcon={true}
          rightIconTitle={t('INSIGHTS.BIODIVERSITY.TITLE')}
          rightIconBody={<div>{t('INSIGHTS.BIODIVERSITY.INFO')}</div>}
        />
        <div>
          <Semibold>{t('INSIGHTS.BIODIVERSITY.HEADER')}</Semibold>
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

// export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Biodiversity));
export default Biodiversity;
