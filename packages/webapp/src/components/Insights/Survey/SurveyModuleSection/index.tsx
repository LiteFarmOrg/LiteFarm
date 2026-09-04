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

import SurveyModuleCard, { SurveyState } from '../SurveyModuleCard';
import SurveyBandLegend from '../SurveyBandLegend';
import styles from './styles.module.scss';

export interface SurveyModule {
  surveyId: string;
  title: string;
  survey: SurveyState;
}

export interface SurveyModuleSectionProps {
  modules: SurveyModule[];
  onModuleAction: (surveyId: string) => void;
}

const SurveyModuleSection = ({ modules, onModuleAction }: SurveyModuleSectionProps) => {
  return (
    <div className={styles.grid}>
      {modules.map(({ surveyId, title, survey }) => (
        <SurveyModuleCard
          key={surveyId}
          title={title}
          survey={survey}
          onAction={() => onModuleAction(surveyId)}
        />
      ))}
      <SurveyBandLegend className={styles.legend} />
    </div>
  );
};

export default SurveyModuleSection;
