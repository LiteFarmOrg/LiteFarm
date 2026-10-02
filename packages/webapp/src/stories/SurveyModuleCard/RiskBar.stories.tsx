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
import RiskBar, {
  type RiskBarProps,
} from '../../components/Insights/Survey/SurveyModuleCard/RiskBar';
import { RISK_LEVELS } from '../../components/Insights/Survey/utils';

const meta: Meta<RiskBarProps> = {
  title: 'Components/SurveyModuleCard/RiskBar',
  component: RiskBar,
  decorators: [
    ...componentDecorators,
    (Story) => (
      <div style={{ width: 168 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    riskLevel: { control: { type: 'select' }, options: [undefined, ...RISK_LEVELS] },
  },
};
export default meta;

type Story = StoryObj<typeof RiskBar>;

export const VeryLowRisk: Story = { args: { riskLevel: 'Very Low Risk' } };

export const LowRisk: Story = { args: { riskLevel: 'Low Risk' } };

export const ModerateRisk: Story = { args: { riskLevel: 'Moderate Risk' } };

export const HighRisk: Story = { args: { riskLevel: 'High Risk' } };

export const VeryHighRisk: Story = { args: { riskLevel: 'Very High Risk' } };

export const NoScore: Story = { args: { riskLevel: undefined } };
