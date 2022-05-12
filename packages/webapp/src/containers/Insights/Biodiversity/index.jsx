import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import insightStyles from '../styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import {
  biodiversityErrorSelector,
  biodiversityLoadingSelector,
  biodiversitySelector,
} from '../selectors';
import BiodiversitySpecies from '../../../components/Insights/BiodiversitySpecies';
import { useTranslation } from 'react-i18next';
import { Semibold } from '../../../components/Typography';
import { getBiodiversityData } from '../actions';
import BiodiversityLoadingModal from '../../../components/Modals/BiodiversityLoadingModal/BiodiversityLoadingModal';
import history from '../../../history';

const Biodiversity = () => {
  const biodiversityData = useSelector(biodiversitySelector);
  const biodiversityLoading = useSelector(biodiversityLoadingSelector);
  const biodiversityError = useSelector(biodiversityErrorSelector);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const getMinutesSinceTime = (time) => {
    return Math.round((Date.now() - time) / (1000 * 60));
  };

  useEffect(() => {
    if (!(biodiversityData.timeFetched && getMinutesSinceTime(biodiversityData.timeFetched) < 30)) {
      dispatch(getBiodiversityData());
    }
    dispatch(getBiodiversityData());
  }, []);

  const biodiversityInfoItems = biodiversityData.data.map((current, index) => {
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
      {biodiversityLoading || biodiversityError ? (
        <BiodiversityLoadingModal
          dismissModal={dismissModal}
          loadingError={biodiversityError}
          minutes={30 - getMinutesSinceTime(biodiversityData.timeFetched)}
        />
      ) : (
        biodiversityInfoItems
      )}
    </div>
  );
};

export default Biodiversity;
