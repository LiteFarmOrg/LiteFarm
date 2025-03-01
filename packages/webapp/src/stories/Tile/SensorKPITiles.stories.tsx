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
import SensorReadingKPI, { SensorReadingKPIprops } from '../../components/Tile/SensorReadingKPI';
import { componentDecorators } from '../Pages/config/Decorators';

type PropTypes = SensorReadingKPIprops;

type TemplateProps = Partial<BentoLayoutProps> & {
  TileComponent: (props: PropTypes) => JSX.Element;
  tileComponentProps: PropTypes;
};

const Template = ({ TileComponent, tileComponentProps, layoutConfig }: TemplateProps) => {
  return layoutConfig ? (
    <BentoLayout layoutConfig={layoutConfig}>
      {new Array(layoutConfig.maxColumns + 2).fill('').map(() => {
        return TileComponent(tileComponentProps);
      })}
    </BentoLayout>
  ) : (
    TileComponent(tileComponentProps)
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

export const SensorReadingKPIBento: Story = {
  args: {
    TileComponent: SensorReadingKPI,
    tileComponentProps: {
      measurement: 'Soil Water Potential',
      value: 50,
      unit: '°F',
    },
    layoutConfig: {
      gapInPx: 8,
      maxColumns: 3,
    },
  },
};

export const SensorReadingKPIOne: Story = {
  args: {
    TileComponent: SensorReadingKPI,
    tileComponentProps: {
      measurement: 'Soil Water Potential',
      value: 50,
      unit: '°F',
    },
  },
};
