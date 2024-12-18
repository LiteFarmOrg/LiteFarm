/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

const Biodiversity = () => {
  let navigate = useNavigate();
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
    navigate('/Insights');
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
        <BiodiversityLoadingModal dismissModal={dismissModal} loadingError={biodiversityError} />
      ) : (
        biodiversityInfoItems
      )}
    </div>
  );
};

export default Biodiversity;
