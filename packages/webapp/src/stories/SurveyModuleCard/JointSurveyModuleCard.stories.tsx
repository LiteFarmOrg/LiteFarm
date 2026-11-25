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
import SurveyModuleCard, {
  type SurveyModuleCardProps,
} from '../../components/Insights/Survey/SurveyModuleCard';

const COMPLETED_AT = new Date('2026-07-03T00:00:00');
const STARTED_AT = new Date('2026-08-12T00:00:00');

const LAND_AWEAI_TITLE = "Land tenure & women's empowerment (A-WEAI)";
const PRODUCTIVITY_BIODIVERSITY_TITLE = 'Productivity and agrobiodiversity';

const meta: Meta<SurveyModuleCardProps> = {
  title: 'Components/SurveyModuleCard/Joint',
  component: SurveyModuleCard,
  decorators: [
    (Story) => (
      <div style={{ width: '486px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
    ...componentDecorators,
  ],
  args: {
    onAction: () => console.log('action'),
  },
};
export default meta;

type Story = StoryObj<typeof SurveyModuleCard>;

export const LandAweaiBothScored: Story = {
  args: {
    title: LAND_AWEAI_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'land_tenure', display: 'gauge', status: 'scored', score: 67 },
        { id: 'aweai', display: 'gauge', status: 'scored', score: 82 },
      ],
    },
  },
};

export const LandAweaiNotApplicableNoWomen: Story = {
  args: {
    title: LAND_AWEAI_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'land_tenure', display: 'gauge', status: 'scored', score: 67 },
        { id: 'aweai', display: 'gauge', status: 'not-applicable', hasNoWomen: true },
      ],
    },
  },
};

export const LandAweaiNotApplicable: Story = {
  args: {
    title: LAND_AWEAI_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'land_tenure', display: 'gauge', status: 'scored', score: 33 },
        { id: 'aweai', display: 'gauge', status: 'not-applicable', hasNoWomen: false },
      ],
    },
  },
};

export const LandAweaiNewVersion: Story = {
  args: {
    title: LAND_AWEAI_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      hasNewVersion: true,
      halves: [
        { id: 'land_tenure', display: 'gauge', status: 'scored', score: 67 },
        { id: 'aweai', display: 'gauge', status: 'scored', score: 82 },
      ],
    },
  },
};

export const ProductivityBiodiversityBothCompleted: Story = {
  args: {
    title: PRODUCTIVITY_BIODIVERSITY_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'biodiversity', display: 'gauge', status: 'scored', score: 58 },
        { id: 'productivity', display: 'dashboard-link', status: 'completed' },
      ],
    },
  },
};

export const ProductivityBiodiversitySingleIndexFallback: Story = {
  args: {
    title: PRODUCTIVITY_BIODIVERSITY_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'biodiversity', display: 'gauge', status: 'scored', score: 41.3 },
        { id: 'productivity', display: 'dashboard-link', status: 'completed' },
      ],
    },
  },
};

export const ProductivityNotChosen: Story = {
  args: {
    title: PRODUCTIVITY_BIODIVERSITY_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'biodiversity', display: 'gauge', status: 'scored', score: 58 },
        { id: 'productivity', display: 'dashboard-link', status: 'not-applicable' },
      ],
    },
  },
};

export const BiodiversityNotChosen: Story = {
  args: {
    title: PRODUCTIVITY_BIODIVERSITY_TITLE,
    survey: {
      type: 'completed',
      completedAt: COMPLETED_AT,
      halves: [
        { id: 'biodiversity', display: 'gauge', status: 'not-applicable' },
        { id: 'productivity', display: 'dashboard-link', status: 'completed' },
      ],
    },
  },
};

export const NotStarted: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '235px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: LAND_AWEAI_TITLE,
    survey: { type: 'not-started', estimatedMinutes: 15 },
  },
};

export const InProgress: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '235px' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: PRODUCTIVITY_BIODIVERSITY_TITLE,
    survey: { type: 'in-progress', progress: 43, startedAt: STARTED_AT },
  },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: LandAweaiNotApplicableNoWomen.args,
};
