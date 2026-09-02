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

import { useTranslation } from 'react-i18next';
import { SurveyScoreBand } from './surveyScoreBand';

const useSurveyScoreBandLabels = (): Record<SurveyScoreBand, string> => {
  const { t } = useTranslation();

  return {
    '1-very-low': t('INSIGHTS.SURVEY.BAND.VERY_LOW'),
    '2-low': t('INSIGHTS.SURVEY.BAND.LOW'),
    '3-medium': t('INSIGHTS.SURVEY.BAND.MEDIUM'),
    '4-high': t('INSIGHTS.SURVEY.BAND.HIGH'),
    '5-very-high': t('INSIGHTS.SURVEY.BAND.VERY_HIGH'),
  };
};

export default useSurveyScoreBandLabels;
