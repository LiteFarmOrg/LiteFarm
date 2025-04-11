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
import PureIrrigationPrescription from '../../components/IrrigationPrescription/';
import { mockField, mockPivot, mockUriData, mockVriZones, mockVriZonesFive } from './mockData';
import { componentDecorators } from '../Pages/config/Decorators';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureIrrigationPrescription> = {
  title: 'Components/IrrigationPrescription',
  component: PureIrrigationPrescription,
  decorators: componentDecorators,
};

export default meta;

type Story = StoryObj<typeof PureIrrigationPrescription>;

export const URIPrescription: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    uriData: {
      application_depth: mockUriData.application_depth,
      application_depth_unit: mockUriData.application_depth_unit,
      soil_moisture_deficit: mockUriData.soil_moisture_deficit,
    },
  },
};

export const VRIPrescription: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    vriZones: mockVriZones,
  },
};

export const VRIPrescriptionFiveZones: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    vriZones: mockVriZonesFive,
  },
};
