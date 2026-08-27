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

import { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../Pages/config/Decorators';
import SurveyModuleCard, { type SurveyModuleCardProps } from '../../components/SurveyModuleCard';

const COMPLETED_AT = new Date('2026-07-03T00:00:00');
const STARTED_AT = new Date('2026-08-12T00:00:00');

const meta: Meta<SurveyModuleCardProps> = {
  title: 'Components/SurveyModuleCard',
  component: SurveyModuleCard,
  decorators: [
    ...componentDecorators,
    (Story) => (
      <div style={{ minWidth: '235px', width: 'min-content' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onAction: () => console.log('action'),
  },
};
export default meta;

type Story = StoryObj<typeof SurveyModuleCard>;

export const NotStarted: Story = {
  args: {
    title: 'Land tenure',
    survey: { type: 'not-started', estimatedMinutes: 10 },
  },
};

export const InProgress: Story = {
  args: {
    title: 'Dietary diversity',
    survey: { type: 'in-progress', progress: 43, startedAt: STARTED_AT },
  },
};

export const CompletedNoScore: Story = {
  args: {
    title: 'Qualitative economic indicator',
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
    },
  },
};

export const CompletedWithScore: Story = {
  args: {
    title: 'Soil health',
    survey: { type: 'completed', completedAt: COMPLETED_AT, score: 72 },
  },
};

export const LongTitle: Story = {
  args: {
    title: 'Productivity, income and value added',
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      score: 64,
    },
  },
};
