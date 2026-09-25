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

import { useEffect } from 'react';
import { SURVEY_INFO, getLatestCdnPath } from './surveyConfig';
import { DO_CDN_URL } from '../../../util/constants';
import { getLanguageFromLocalStorage } from '../../../util/getLanguageFromLocalStorage';
import { useIsOffline } from '../../hooks/useOfflineDetector/useIsOffline';

const prefetchDefinition = async (
  cdnDirectory: string,
  version: string,
  fallbackVersion?: string,
) => {
  const url = `${DO_CDN_URL}/${cdnDirectory}/${version}.json`;
  if (await caches.match(url)) {
    return;
  }
  const response = await fetch(url);
  if (!response.ok && fallbackVersion) {
    await prefetchDefinition(cdnDirectory, fallbackVersion);
  }
};

export default function usePrefetchModuleDefinitions(parentSurveyId: string, countryCode?: string) {
  const isOffline = useIsOffline();

  useEffect(() => {
    if (isOffline || (countryCode && SURVEY_INFO[parentSurveyId]?.versionsByCountry[countryCode])) {
      return;
    }
    const language = getLanguageFromLocalStorage() || 'en';
    Object.keys(SURVEY_INFO)
      .filter((surveyId) => SURVEY_INFO[surveyId].parentSurveyId === parentSurveyId)
      .forEach((moduleId) => {
        const path = getLatestCdnPath(moduleId, countryCode, language);
        if (!path) {
          return;
        }
        prefetchDefinition(
          SURVEY_INFO[moduleId].cdnDirectory,
          path.version,
          path.fallbackVersion,
        ).catch(() => undefined);
      });
  }, [parentSurveyId, countryCode, isOffline]);
}
