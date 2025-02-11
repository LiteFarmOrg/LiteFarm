/*
 *  Copyright 2024 LiteFarm.org
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
import OverviewStats, { OverviewStatsProps } from '../../components/OverviewStats';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as SensorIcon } from '../../assets/images/devices/signal-01.svg';
import { ReactComponent as SensorArrayIcon } from '../../assets/images/farmMapFilter/SensorArray.svg';
import styles from './styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof OverviewStats> = {
  title: 'Components/OverviewStats',
  component: OverviewStats,
  decorators: [...componentDecorators],
};
export default meta;

type Story = StoryObj<typeof OverviewStats>;

const stats = {
  SENSOR_ARRAY: 3,
  'Soil Water Potential Sensor': 11,
  Temperature: 2,
  'Extra data not to be displayed': 1,
};

const translationMappings = [
  { key: 'SENSOR_ARRAY', translationKey: 'SENSOR.SENSOR_ARRAYS' },
  { key: 'Soil Water Potential Sensor', translationKey: 'SENSOR.READING.SOIL_WATER_POTENTIAL' },
  { key: 'Temperature', translationKey: 'SENSOR.CANOPY_TEMPERATURE' },
];

export const LargeScreen: Story = {
  args: {
    stats,
    translationMappings,
  },
};

export const CompactScreen: Story = {
  args: {
    stats,
    translationMappings,
    isCompact: true,
  },
};

const format: OverviewStatsProps['format'] = (statsKey, label) => {
  const Icon = statsKey === 'SENSOR_ARRAY' ? SensorArrayIcon : SensorIcon;
  return (
    <div className={styles.labelWrapper}>
      <span className={styles.icon}>
        <Icon />
      </span>
      <span className={styles.text}>{label}</span>
    </div>
  );
};

export const WithFormatFunction: Story = {
  args: {
    stats,
    translationMappings,
    format,
  },
};
