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

/**
 * Resolves a survey's display title. Each title is a literal t() call so i18next-parser extracts
 * the key; add a literal entry per survey. Surveys without an entry fall back to a generic title.
 * Kept free of component imports so it can be used by both the tile list and the survey/results
 * pages without an import cycle.
 */
export const useSurveyTitles = (): Record<string, string> => {
  const { t } = useTranslation();

  return {
    tape: t('INSIGHTS.TAPE.TITLE'),
    tape_economic: t('INSIGHTS.TAPE_ECONOMIC.TITLE'),
    tape_food_security: t('INSIGHTS.TAPE_FOOD_SECURITY.TITLE'),
    tape_dietary_diversity: t('INSIGHTS.TAPE_DIETARY_DIVERSITY.TITLE'),
    tape_youth: t('INSIGHTS.TAPE_YOUTH.TITLE'),
    tape_soil: t('INSIGHTS.TAPE_SOIL.TITLE'),
    tape_pesticides: t('INSIGHTS.TAPE_PESTICIDES.TITLE'),
    tape_land_aweai: t('INSIGHTS.TAPE_LAND_AWEAI.TITLE'),
    tape_productivity_biodiversity: t('INSIGHTS.TAPE_PRODUCTIVITY_BIODIVERSITY.TITLE'),
    cathi_gao: t('INSIGHTS.CATHI_GAO.TITLE'),
  };
};

export const useSurveyTitle = (surveyId: string): string => {
  const { t } = useTranslation();
  const titleBySurveyId = useSurveyTitles();

  return titleBySurveyId[surveyId] ?? t('INSIGHTS.SURVEY.TITLE');
};
