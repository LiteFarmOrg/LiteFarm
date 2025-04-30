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

import { Meta, StoryObj } from '@storybook/react/*';
import clsx from 'clsx';
import DescriptionListTile, { LabelSize } from '../../../components/Tile/DescriptionListTile';
import { iPData, backgroundIconData, dataWithIconData, mockTextData } from './mockData';
import weatherKPIStyle from '../../../containers/SensorReadings/v2/styles.module.scss';
import ipKPIStyle from '../../../components/IPDetailKPI/styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof DescriptionListTile> = {
  title: 'Components/Tile/DescriptionListTile',
  component: DescriptionListTile,
  decorators: [
    (story) => {
      return <dl style={{ padding: '24px', background: 'white' }}>{story()}</dl>;
    },
  ],
};
export default meta;

type Story = StoryObj<typeof DescriptionListTile>;

export const Default: Story = {
  args: mockTextData[0],
};

export const SmallLabel: Story = {
  args: { ...mockTextData[0], labelSize: LabelSize.SMALL },
};

export const HideLabel: Story = {
  args: { ...mockTextData[0], hideLabel: true },
};

export const DataWithIcon: Story = {
  args: dataWithIconData,
};

export const BackgroundIcon: Story = {
  args: backgroundIconData,
};

export const Many = {
  render: () => {
    return (
      <div className={clsx(weatherKPIStyle.weatherKPI)}>
        {mockTextData.map((props, index) => (
          <DescriptionListTile key={index} {...props} />
        ))}
      </div>
    );
  },
};

export const Variety = {
  render: () => {
    return (
      <div className={clsx(ipKPIStyle.kpi)}>
        {iPData.map((props, index) => (
          <DescriptionListTile
            {...props}
            key={props.label}
            hideLabel={!index}
            labelSize={index > 3 ? LabelSize.SMALL : undefined}
          />
        ))}
      </div>
    );
  },
};
