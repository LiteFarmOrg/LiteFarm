/*
 *  Copyright 2025 LiteFarm.org
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

import WeatherKPI from '../../components/WeatherKPI';
import { Meta, StoryObj } from '@storybook/react/*';
import { mockIconData, mockTextData } from './mockData';
import styles from './styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof WeatherKPI> = {
  title: 'Components/WeatherKPI',
  component: WeatherKPI,
  decorators: (story) => {
    return <div style={{ padding: '24px', background: 'white' }}>{story()}</div>;
  },
};
export default meta;

type Story = StoryObj<typeof WeatherKPI>;

export const Text: Story = {
  args: { data: mockTextData },
};

export const Icon: Story = {
  args: { data: mockIconData, className: styles.icon },
};
