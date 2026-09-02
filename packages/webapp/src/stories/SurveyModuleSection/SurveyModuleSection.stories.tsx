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

import type { CSSProperties } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import SurveyModuleSection, {
  type SurveyModule,
} from '../../components/Insights/Survey/SurveyModuleSection';

const COMPLETED_AT = new Date('2026-07-03T00:00:00');
const STARTED_AT = new Date('2026-08-12T00:00:00');

const MODULES: SurveyModule[] = [
  {
    surveyId: 'tape_soil',
    title: 'Soil health',
    survey: { type: 'completed', completedAt: COMPLETED_AT, score: 12 },
  },
  {
    surveyId: 'tape_land_aweai',
    title: 'Land tenure',
    survey: { type: 'not-started', estimatedMinutes: 10 },
  },
  {
    surveyId: 'tape_dietary_diversity',
    title: 'Dietary diversity',
    survey: { type: 'in-progress', progress: 43, startedAt: STARTED_AT },
  },
  {
    surveyId: 'tape_youth',
    title: 'Youth employment opportunity and emigration',
    survey: { type: 'completed', completedAt: COMPLETED_AT },
  },
  {
    surveyId: 'tape_productivity_biodiversity',
    title: 'Productivity, income and value added',
    survey: { type: 'completed', completedAt: COMPLETED_AT, score: 64 },
  },
  {
    surveyId: 'tape_pesticides',
    title: 'Exposure to pesticides',
    survey: { type: 'completed', completedAt: COMPLETED_AT },
  },
  {
    surveyId: 'tape_food_security',
    title: 'Food security',
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      score: 35,
      hasNewVersion: true,
    },
  },
  {
    surveyId: 'tape_economic',
    title: 'Qualitative economic indicator',
    survey: { type: 'completed', completedAt: COMPLETED_AT, score: 92 },
  },
];

const meta: Meta<typeof SurveyModuleSection> = {
  title: 'Components/SurveyModuleSection',
  component: SurveyModuleSection,
  decorators: [
    ...componentDecorators,
    (Story) => (
      <div style={{ maxWidth: '1024px', padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    modules: MODULES,
    onModuleAction: (surveyId: string) => console.log(surveyId),
  },
};
export default meta;

type Story = StoryObj<typeof SurveyModuleSection>;

export const EightModules: Story = {};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
