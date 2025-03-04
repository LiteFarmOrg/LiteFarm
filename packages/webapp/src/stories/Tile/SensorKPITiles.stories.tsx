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

// type PropTypes = SensorReadingKPIprops | SensorKPIprops;

type TemplateProps = {
  TileComponent: () => JSX.Element;
  bento: boolean;
};

const Template = ({ TileComponent, bento }: TemplateProps) => {
  return bento ? (
    <BentoLayout>
      {new Array(5).fill('').map((_val, id) => {
        return <TileComponent key={id} />;
      })}
    </BentoLayout>
  ) : (
    <TileComponent />
  );
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
  return <SensorReadingKPI measurement={'Soil Water Potential'} value={50} unit={'°F'} />;
};

export const SensorReadingKPIBento: Story = {
  args: {
    TileComponent: SensorReadingKPITile,
    bento: true,
  },
};

export const SensorReadingKPIOne: Story = {
  args: {
    TileComponent: SensorReadingKPITile,
  },
};

const SensorKPITile = () => {
  const props = {
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

  return <SensorKPI {...props} />;
};

export const SensorKPIBento: Story = {
  args: {
    TileComponent: SensorKPITile,
    bento: true,
  },
};

export const SensorKPIOne: Story = {
  args: {
    TileComponent: SensorKPITile,
  },
};

const SensorKPITileManyParams = () => {
  const props = {
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
        measurement: 'Ambient Temperature',
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

  return <SensorKPI {...props} />;
};

export const SensorKPIManyParamsBento: Story = {
  args: {
    TileComponent: SensorKPITileManyParams,
    bento: true,
  },
};

export const SensorKPIManyParamsOne: Story = {
  args: {
    TileComponent: SensorKPITileManyParams,
  },
};
