/*
 *  Copyright 2023 LiteFarm.org
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

import WeatherStationReadingsKPI from '../../components/Sensor/v2/WeatherStationReadingsKPI';
import { Meta, StoryObj } from '@storybook/react/*';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof WeatherStationReadingsKPI> = {
  title: 'Components/Sensor/WeatherStationReadingsKPI',
  component: WeatherStationReadingsKPI,
  decorators: (story) => {
    return <div style={{ padding: '24px', background: 'white' }}>{story()}</div>;
  },
};
export default meta;

type Story = StoryObj<typeof WeatherStationReadingsKPI>;

const mockData = [
  { label: 'Temperature', data: '23°C' },
  { label: 'Wind speed & direction', data: '8km/h SW' },
  { label: 'Cumulative rainfall', data: '20mm' },
  { label: 'Relative Humidity', data: '33%' },
  { label: 'Barometric Pressure', data: '8hPa' },
  { label: 'Solar radiation', data: '20W/m2' },
  { label: 'Rainfall rate', data: '2mm/h' },
];

export const Default: Story = {
  args: { weatherData: mockData },
};
