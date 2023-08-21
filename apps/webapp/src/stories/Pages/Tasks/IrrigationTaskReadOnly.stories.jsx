/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
import React from 'react';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import decorator from '../config/Decorators';
import UnitTest from '../../../test-utils/storybook/unit';
import { waterUsage } from '../../../util/convert-units/unit';

export default {
  title: 'Form/Crop/Tasks/IrrigationTaskReadOnly',
  component: PureTaskReadOnly,
  decorators: decorator,
};

const Template = (args) => <PureTaskReadOnly {...args} />;

const args = {
  task: {
    task_id: 136,
    due_date: '2023-04-01T00:00:00.000',
    owner_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    notes: null,
    completion_notes: null,
    task_type_id: 17,
    assignee_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    coordinates: null,
    duration: null,
    wage_at_moment: 0,
    happiness: null,
    complete_date: null,
    late_time: null,
    for_review_time: null,
    abandon_date: null,
    locations: [
      {
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
        name: 'LiteFarm garden',
        notes: '',
        location_id: '434301c6-b864-11ed-b55b-e66db4bef551',
        deleted: false,
        location_defaults: null,
        figure_id: '43446386-b864-11ed-b55b-e66db4bef551',
        type: 'garden',
        total_area: 81931,
        total_area_unit: 'ha',
        grid_points: [
          { lat: 49.25857280296026, lng: -123.25063145797644 },
          { lat: 49.26005723350669, lng: -123.24595368545447 },
          { lat: 49.25851678583901, lng: -123.24445164840613 },
          { lat: 49.25680823309887, lng: -123.24921525161658 },
        ],
        perimeter: 1198,
        perimeter_unit: 'km',
        station_id: null,
        organic_status: 'Non-Organic',
        transition_date: null,
      },
    ],
    managementPlans: [],
    abandonment_reason: null,
    other_abandonment_reason: null,
    abandonment_notes: null,
    location_defaults: [null],
    taskType: {
      task_type_id: 17,
      task_name: 'Irrigation',
      task_translation_key: 'IRRIGATION_TASK',
      farm_id: null,
      deleted: false,
    },
    irrigation_task: {
      task_id: 136,
      application_depth: null,
      application_depth_unit: null,
      measuring_type: 'VOLUME',
      estimated_duration: null,
      estimated_duration_unit: null,
      estimated_flow_rate: null,
      estimated_flow_rate_unit: null,
      estimated_water_usage: 1,
      estimated_water_usage_unit: 'gal',
      irrigation_type: {
        irrigation_type_id: 19,
        irrigation_type_name: 'CHANNEL',
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
        default_measuring_type: 'VOLUME',
        irrigation_type_translation_key: 'CHANNEL',
      },
      percent_of_location_irrigated: null,
      default_location_flow_rate: false,
      default_location_application_depth: false,
      default_irrigation_task_type_location: false,
      default_irrigation_task_type_measurement: false,
      irrigation_type_translation_key: 'CHANNEL',
      irrigation_type_name: 'CHANNEL',
    },
    pinCoordinates: [],
    managementPlansByPinCoordinate: {},
    locationsById: {},
    managementPlansByLocation: {},
  },
  users: [{ user_id: '1', first_name: 'John', last_name: 'Doe' }],
  user: {
    user_id: '1',
    grid_points: {
      lat: 49.276368899999994,
      lng: -123.177324,
    },
  },
  isAdmin: true,
  managementPlansByLocationIds: [],
  onGoBack: () => {},
  products: [],
  harvestUseTypes: [],
  maxZoomRef: { current: 19 },
  getMaxZoom: () => 19,
};

export const Metric = Template.bind({});
Metric.args = { ...args, system: 'metric' };
Metric.play = async ({ canvasElement }) => {
  const waterUsageTest = new UnitTest(canvasElement, 'unit', waterUsage);

  // ideally "l", but this is an edge case and its improvement is low priority
  await waterUsageTest.selectedUnitToBeInTheDocument('ml');
  await waterUsageTest.visibleInputToHaveValue(1000);
  await waterUsageTest.hiddenInputToHaveValue(1);
};

export const Imperial = Template.bind({});
Imperial.args = { ...args, system: 'imperial' };
Imperial.play = async ({ canvasElement }) => {
  const waterUsageTest = new UnitTest(canvasElement, 'unit', waterUsage);

  await waterUsageTest.selectedUnitToBeInTheDocument('gal');
  await waterUsageTest.visibleInputToHaveValue(
    waterUsageTest.convertDBValueToDisplayValue(1, 'gal'),
  );
  await waterUsageTest.hiddenInputToHaveValue(1);
};
