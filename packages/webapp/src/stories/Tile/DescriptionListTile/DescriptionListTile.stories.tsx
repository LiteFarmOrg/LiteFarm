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
import DescriptionListTile from '../../../components/Tile/DescriptionListTile';
import { mockIconData, mockTextData } from './mockData';
import styles from './styles.module.scss';
import weatherKPIStyle from '../../../containers/SensorReadings/v2/styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof DescriptionListTile> = {
  title: 'Components/Tile/DescriptionListTile',
  component: DescriptionListTile,
  decorators: (story) => {
    return <div style={{ padding: '24px', background: 'white' }}>{story()}</div>;
  },
};
export default meta;

type Story = StoryObj<typeof DescriptionListTile>;

export const Text: Story = {
  args: mockTextData[0],
};

export const Icon: Story = {
  args: mockIconData[0],
};

export const Many = {
  render: () => {
    return (
      <dl className={clsx(weatherKPIStyle.weatherKPI)}>
        {mockTextData.map((props, index) => (
          <DescriptionListTile key={index} {...props} />
        ))}
      </dl>
    );
  },
};
