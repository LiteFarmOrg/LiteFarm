/*
 *  Copyright 2026 LiteFarm.org
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

import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import insightStyles from '../styles.module.scss';
import { Semibold, Text } from '../../../components/Typography';
import { useGetLatestSurveyResponseQuery } from '../../../store/api/surveyApi';
import { surveyInProgressSelector } from './surveyDraftSlice';
import { useSurveyTitle } from './useSurveyTitle';
import { surveyHasResultsPage } from './surveyConfig';

interface SurveyInsightTileProps {
  surveyId: string;
  image: string;
  index: number;
}

/**
 * One survey row in the Insights list. Owns its own saved-response query so each survey can show
 * its individual status (loading / in progress / completed / not filled) and link to either the
 * survey or its results.
 */
function SurveyInsightTile({ surveyId, image, index }: SurveyInsightTileProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const title = useSurveyTitle(surveyId);

  const {
    data: surveyResponse,
    isError,
    isFetching,
  } = useGetLatestSurveyResponseQuery({ surveyKey: surveyId });
  const inProgress = useSelector(surveyInProgressSelector(surveyId));

  const isCompleted = !isError && !!surveyResponse?.id;

  let currentData = t('INSIGHTS.TAPE.NOT_FILLED');
  if (isFetching) {
    currentData = t('common:LOADING');
  } else if (inProgress) {
    currentData = t('INSIGHTS.TAPE.IN_PROGRESS');
  } else if (isCompleted) {
    currentData = surveyHasResultsPage(surveyId)
      ? t('INSIGHTS.TAPE.COMPLETED')
      : t('common:COMPLETED');
  }

  const isLoading = currentData === t('common:LOADING');
  const route = isCompleted
    ? `/insights/survey/${surveyId}/results`
    : `/insights/survey/${surveyId}`;

  return (
    <div className={`insightItem item-${index} ${insightStyles.insightItem}`}>
      <div
        className={`itemButton item-${index} ${insightStyles.itemButton} ${
          isLoading ? insightStyles.isLoading : ''
        }`}
        onClick={() => history.push(route)}
      >
        <img
          className={`itemIcon item-${index} ${insightStyles.itemIcon}`}
          src={image}
          alt={title}
        />
        <div className={`itemText item-${index} ${insightStyles.itemText}`}>
          <Semibold className={insightStyles.itemTitle}>{title}</Semibold>
          <Text>{`${t('INSIGHTS.CURRENT')}: ${currentData ?? 0}`}</Text>
        </div>
        <BsChevronRight className={insightStyles.itemArrow} />
      </div>
      <hr className={insightStyles.defaultLine} />
    </div>
  );
}

export default SurveyInsightTile;
