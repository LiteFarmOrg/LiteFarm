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
import PureIrrigationPrescriptionMapView from '../../components/IrrigationPrescription/IrrigationPrescriptionMapView';
import styles from './styles.module.scss';
import { mockField, mockPivot, mockVriZones, mockVriZonesFive } from './mockData';
import { componentDecorators } from '../Pages/config/Decorators';

// https://storybook.js.org/docs/writing-stories/typescript
const meta: Meta<typeof PureIrrigationPrescriptionMapView> = {
  title: 'Components/IrrigationPrescription/MapView',
  component: PureIrrigationPrescriptionMapView,
  decorators: componentDecorators,
};

export default meta;

type Story = StoryObj<typeof PureIrrigationPrescriptionMapView>;

export const URIPivotView: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    className: styles.mapContainer,
  },
};

export const VRIPivotView: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    className: styles.mapContainer,
    vriZones: mockVriZones,
  },
};

export const VRIPivotFiveZonesView: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    className: styles.mapContainer,
    vriZones: mockVriZonesFive,
  },
};

export const ImperialUnitsPivotArm: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    className: styles.mapContainer,
    vriZones: mockVriZonesFive,
    system: 'imperial',
  },
};

export const PartialAnglePivotVRI: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    pivotArc: {
      start_angle: 215,
      end_angle: 360,
    },
    className: styles.mapContainer,
    vriZones: mockVriZones,
  },
};

export const PartialAnglePivotURI: Story = {
  args: {
    fieldLocation: mockField,
    pivotCenter: mockPivot.center,
    pivotRadiusInMeters: mockPivot.radius,
    pivotArc: {
      start_angle: 215,
      end_angle: 360,
    },
    className: styles.mapContainer,
  },
};
