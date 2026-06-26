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

import { ComponentType } from 'react';
import tape_survey from '../../../assets/images/insights/tape_survey.svg';
import TapeResults from './TapeResults';
import ThankYouResults from './ThankYouResults';

interface SurveyInfo {
  image: string;
  ResultsComponent: ComponentType<{ surveyId: string }>;
}

/**
 * Render-only metadata for each survey, keyed by the survey `key` (the same string used as the
 * DB survey identifier). Availability and CDN version come from the backend; this map only holds
 * what the frontend needs to draw the tile and the results page. A survey present in the backend
 * but absent here is not rendered, so a new survey can ship its backend row first and its tile later.
 */
export const SURVEY_INFO: Record<string, SurveyInfo> = {
  tape: {
    image: tape_survey,
    ResultsComponent: TapeResults,
  },
};

/**
 * The results component for a survey, defaulting to the generic thank-you page when the survey
 * defines none.
 */
export const getResultsComponent = (surveyId: string): ComponentType<{ surveyId: string }> =>
  SURVEY_INFO[surveyId]?.ResultsComponent ?? ThankYouResults;
