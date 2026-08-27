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
import Gauge, { type GaugeProps } from '../../components/SurveyModuleCard/Gauge';

const meta: Meta<GaugeProps> = {
  title: 'Components/SurveyModuleCard/Gauge',
  component: Gauge,
  decorators: componentDecorators,
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};
export default meta;

type Story = StoryObj<typeof Gauge>;

export const VeryLow: Story = { args: { score: 12 } };

export const Low: Story = { args: { score: 32 } };

export const Medium: Story = { args: { score: 52 } };

export const High: Story = { args: { score: 72 } };

export const VeryHigh: Story = { args: { score: 92 } };

export const NoScore: Story = { args: { score: undefined } };
