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
import styles from './styles.module.scss';
import insightStyles from '../styles.module.scss';
import { Semibold } from '../../../components/Typography';
import PageTitle from '../../../components/PageTitle';
import { useSurveyTitle } from './useSurveyTitle';

/**
 * Default results component for surveys that do not need a custom visualization. Rendered by the
 * survey results route whenever a survey's entry in SURVEY_INFO does not name its own component.
 */
function ThankYouResults({ surveyId }: { surveyId: string }) {
  const { t } = useTranslation();
  const surveyTitle = useSurveyTitle(surveyId);

  return (
    <div className={insightStyles.insightContainer}>
      <PageTitle title={surveyTitle} backUrl="/Insights" />
      <div className={styles.resultsContainer}>
        <div className={styles.sectionContainer}>
          <Semibold className={styles.titleText}>{t('INSIGHTS.SURVEY.THANK_YOU')}</Semibold>
        </div>
      </div>
    </div>
  );
}

export default ThankYouResults;
