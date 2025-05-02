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
import DescriptionList, { LabelSize } from '../../../components/Tile/DescriptionList';
import { iPData, backgroundIconData, dataWithIconData, mockTextData } from './mockData';
import weatherKPIStyle from '../../../containers/SensorReadings/v2/styles.module.scss';
import ipKPIStyle from '../../../components/IrrigationPrescriptionKPI/styles.module.scss';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof DescriptionList> = {
  title: 'Components/Tile/DescriptionList',
  component: DescriptionList,
  decorators: [
    (story) => {
      return <dl style={{ padding: '24px', background: 'white' }}>{story()}</dl>;
    },
  ],
};
export default meta;

type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
  args: { descriptionListTilesProps: [mockTextData[0]] },
};

export const SmallLabel: Story = {
  args: { descriptionListTilesProps: [{ ...mockTextData[0], labelSize: LabelSize.SMALL }] },
};

export const HideLabel: Story = {
  args: { descriptionListTilesProps: [{ ...mockTextData[0], hideLabel: true }] },
};

export const DataWithIcon: Story = {
  args: { descriptionListTilesProps: [dataWithIconData] },
};

export const BackgroundIcon: Story = {
  args: { descriptionListTilesProps: [backgroundIconData] },
};

export const Many = {
  args: {
    className: weatherKPIStyle.weatherKPI,
    descriptionListTilesProps: mockTextData,
  },
};

export const Variety = {
  args: {
    className: ipKPIStyle.kpi,
    descriptionListTilesProps: iPData,
  },
};
