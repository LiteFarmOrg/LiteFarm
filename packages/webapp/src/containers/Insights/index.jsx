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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { isAdminSelector, userFarmSelector } from '../userFarmSlice';
import { Title } from '../../components/Typography';
import { SURVEY_INFO, getAvailableSurveyIds } from './Survey/surveyConfig';
import SurveyInsightTile from './Survey/SurveyInsightTile';

const Insights = () => {
  const farm = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const { t } = useTranslation();

  // Surveys are shown only to admins. getAvailableSurveyIds gates the list to
  // surveys available in the farm's country (see SURVEY_INFO).
  const surveyTiles = useMemo(() => {
    if (!isAdmin) {
      return [];
    }
    return getAvailableSurveyIds(farm?.country_code).map((surveyId, index) => (
      <SurveyInsightTile
        key={surveyId}
        surveyId={surveyId}
        image={SURVEY_INFO[surveyId].image}
        index={index}
      />
    ));
  }, [farm?.country_code, isAdmin]);

  return (
    <div className={styles.insightContainer}>
      <Title>{t('INSIGHTS.FARM_INSIGHTS_TITLE')}</Title>
      <hr className={styles.defaultLine} />
      {surveyTiles}
    </div>
  );
};

export default Insights;
