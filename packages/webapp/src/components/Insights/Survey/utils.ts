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

export const SURVEY_SCORE_MIN = 0;
export const SURVEY_SCORE_MAX = 100;

export const SURVEY_SCORE_BAND_RANGES = [
  { band: '1-very-low', min: 0, max: 20 },
  { band: '2-low', min: 20, max: 40 },
  { band: '3-medium', min: 40, max: 60 },
  { band: '4-high', min: 60, max: 80 },
  { band: '5-very-high', min: 80, max: 100 },
] as const;

export type SurveyScoreBand = (typeof SURVEY_SCORE_BAND_RANGES)[number]['band'];

const DEFAULT_BAND: SurveyScoreBand = '5-very-high';

export const getSurveyScoreBand = (score: number): SurveyScoreBand =>
  SURVEY_SCORE_BAND_RANGES.find(({ max }) => score <= max)?.band ?? DEFAULT_BAND;
