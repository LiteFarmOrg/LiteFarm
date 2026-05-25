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

import type { Meta, StoryObj } from '@storybook/react';
import FrostBanner from '../../components/WeatherForecast/FrostBanner';
import { componentDecorators } from '../Pages/config/Decorators';

const meta: Meta<typeof FrostBanner> = {
  title: 'Components/WeatherForecast/FrostBanner',
  component: FrostBanner,
  decorators: componentDecorators,
};
export default meta;

type Story = StoryObj<typeof FrostBanner>;

export const Metric: Story = { args: { thresholdLabel: '< 2°C' } };
export const Imperial: Story = { args: { thresholdLabel: '< 36°F' } };
