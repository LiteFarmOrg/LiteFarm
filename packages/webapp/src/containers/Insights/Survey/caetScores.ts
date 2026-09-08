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

import { CAET_SCORE_FIELD } from './surveyConfig';

export const MAX_SCORE = 100;
export const RAW_MAX_SCORE = 4;

export const DIMENSIONS = [
  { id: 'diversity', prefix: 'diversity_1', scoreField: 'div_score' },
  { id: 'synergy', prefix: 'synergy_2', scoreField: 'synergy_score' },
  { id: 'recycling', prefix: 'recycling_3', scoreField: 'recycling_score' },
  { id: 'efficiency', prefix: 'efficiency_4', scoreField: 'efficiency_score' },
  { id: 'resilience', prefix: 'resilience_5', scoreField: 'resilience_score' },
  { id: 'cultureAndFood', prefix: 'culture_6', scoreField: 'cultfood_score' },
  { id: 'cocreationAndKnowledge', prefix: 'knowledge_7', scoreField: 'cocrea_score' },
  { id: 'humanAndSocial', prefix: 'human_8', scoreField: 'human_score' },
  { id: 'circularEconomy', prefix: 'circular_9', scoreField: 'circular_score' },
  { id: 'responsibleGovernance', prefix: 'governance_10', scoreField: 'respgov_score' },
] as const;

export type TAPEDimensionId = (typeof DIMENSIONS)[number]['id'];

export interface TAPEDimension {
  dimension: TAPEDimensionId;
  score: number;
  maxScore: number;
}

export const getTAPEDimensionScores = (
  data: Record<string, unknown> | null | undefined,
): TAPEDimension[] => {
  if (!data) {
    return [];
  }

  return CAET_SCORE_FIELD in data ? readTAPEScores(data) : analyzeTAPEData(data);
};

const readTAPEScores = (data: Record<string, unknown>): TAPEDimension[] =>
  DIMENSIONS.map(({ id, scoreField }) => ({
    dimension: id,
    score: Number(data[scoreField]) || 0,
    maxScore: MAX_SCORE,
  }));

const analyzeTAPEData = (data: Record<string, unknown>): TAPEDimension[] => {
  return DIMENSIONS.map(({ id, prefix }) => {
    const scores = Object.keys(data)
      .filter((key) => key.startsWith(prefix))
      .map((key) => Number(data[key]) || 0);

    if (!scores.length) {
      return { dimension: id, score: 0, maxScore: MAX_SCORE };
    }

    const averageRawScore = scores.reduce((sum, value) => sum + value, 0) / scores.length;

    return {
      dimension: id,
      score: (averageRawScore / RAW_MAX_SCORE) * MAX_SCORE,
      maxScore: MAX_SCORE,
    };
  });
};
