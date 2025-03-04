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

import { Meta, StoryObj } from '@storybook/react';
import BentoLayout, { BentoLayoutProps } from '../../components/Layout/BentoLayout';
import SensorReadingKPI from '../../components/Tile/SensorReadingKPI';
import SensorKPI from '../../components/Tile/SensorKPI';
import { componentDecorators } from '../Pages/config/Decorators';
import { Status } from '../../components/StatusIndicatorPill';
import { ReactNode } from 'react';

const colors = ['#0669E1', '#E8A700', '#266F68', '#D02620', '#8F26F0', '#AA5F04'];

type TemplateProps = {
  children: ReactNode;
};

const Template = ({ children }: TemplateProps) => {
  return <BentoLayout>{children}</BentoLayout>;
};

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof Template> = {
  title: 'Components/Tile/SensorKPITiles',
  component: Template,
  decorators: [...componentDecorators],
};
export default meta;

type Story = StoryObj<typeof Template>;

const SensorReadingKPITile = () => {
  return (
    <SensorReadingKPI
      measurement={'Soil Water Potential'}
      value={50}
      unit={'°F'}
      colorHex="#0669e1"
    />
  );
};

export const SensorReadingKPIBento: Story = {
  args: {
    children: new Array(5).fill('').map((_val, id) => {
      return (
        <SensorReadingKPI
          measurement={'Soil Water Potential'}
          value={50}
          unit={'°F'}
          colorHex={colors[id]}
        />
      );
    }),
  },
};

export const SensorReadingKPIOne: Story = {
  args: {
    children: (
      <SensorReadingKPI
        measurement={'Soil Water Potential'}
        value={50}
        unit={'°F'}
        colorHex={colors[0]}
      />
    ),
  },
};

const sensorKpiProps = {
  sensor: {
    id: 'AS4TG5',
    status: {
      status: Status.ONLINE,
      pillText: 'Online',
      tooltipText: 'Device has sent data in the last 12 hours',
    },
  },
  discriminator: {
    measurement: 'depth_elevation',
    value: 50,
    unit: 'cm',
  },
  measurements: [
    {
      measurement: 'Temperature',
      value: 50,
      unit: '°F',
    },
    {
      measurement: 'Soil Water Potential',
      value: 124,
      unit: 'kPa',
    },
  ],
};

export const SensorKPIBento: Story = {
  args: {
    children: new Array(5).fill('').map((_val, id) => {
      return <SensorKPI {...sensorKpiProps} colorHex={colors[id]} />;
    }),
  },
};

export const SensorKPIOne: Story = {
  args: {
    children: <SensorKPI {...sensorKpiProps} colorHex={colors[0]} />,
  },
};

const extraMeasurements = {
  measurements: [
    {
      measurement: 'Temperature',
      value: 50,
      unit: '°F',
    },
    {
      measurement: 'Wind Speed',
      value: 50,
      unit: 'km/h',
    },
    {
      measurement: 'Wind Direction',
      value: 30,
      unit: 'NE',
    },
    {
      measurement: 'Humidity',
      value: 50,
      unit: '%',
    },
  ],
};

export const SensorKPIManyParamsBento: Story = {
  args: {
    children: new Array(5).fill('').map((_val, id) => {
      return <SensorKPI {...sensorKpiProps} {...extraMeasurements} colorHex={colors[id]} />;
    }),
  },
};

export const SensorKPIManyParamsOne: Story = {
  args: {
    children: <SensorKPI {...sensorKpiProps} {...extraMeasurements} />,
  },
};
