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
  title: 'Form/Crop/Tasks/CleaningTaskReadOnly',
  component: PureTaskReadOnly,
  decorators: decorator,
};

const Template = (args) => <PureTaskReadOnly {...args} />;

const args = {
  task: {
    task_id: 126,
    due_date: '2023-03-28T00:00:00.000',
    owner_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    notes: null,
    completion_notes: null,
    task_type_id: 18,
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
        name: 'Old barn - 7.12 ac',
        notes: '',
        location_id: '043ab9ee-b3da-11ed-9fd8-e66db4bef551',
        deleted: false,
        location_defaults: null,
        figure_id: '043c2aea-b3da-11ed-9fd8-e66db4bef551',
        type: 'barn',
        total_area: 28813.64561172066,
        total_area_unit: 'ac',
        grid_points: [
          { lat: 49.25445272177326, lng: -123.24107295562457 },
          { lat: 49.25587644189321, lng: -123.24202111651134 },
          { lat: 49.25649233145508, lng: -123.23999286358189 },
          { lat: 49.25507333399391, lng: -123.23895367522668 },
        ],
        perimeter: 679,
        perimeter_unit: 'm',
        wash_and_pack: null,
        cold_storage: null,
        used_for_animals: null,
      },
    ],
    managementPlans: [],
    abandonment_reason: null,
    other_abandonment_reason: null,
    abandonment_notes: null,
    location_defaults: [null],
    taskType: {
      task_type_id: 18,
      task_name: 'Cleaning',
      task_translation_key: 'CLEANING_TASK',
      farm_id: null,
      deleted: false,
    },
    cleaning_task: {
      task_id: 126,
      product_id: null,
      product_quantity: null,
      product_quantity_unit: 'l',
      agent_used: false,
      cleaning_target: null,
      water_usage: 3.785411795401,
      water_usage_unit: 'gal',
    },
    pinCoordinates: [],
    managementPlansByPinCoordinate: {},
    locationsById: {
      '043ab9ee-b3da-11ed-9fd8-e66db4bef551': {},
    },
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
  await waterUsageTest.visibleInputToHaveValue(
    waterUsageTest.convertDBValueToDisplayValue(3.785411795401, 'ml'),
  );
  await waterUsageTest.hiddenInputToHaveValue(3.785411795401);
};

export const Imperial = Template.bind({});
Imperial.args = { ...args, system: 'imperial' };
Imperial.play = async ({ canvasElement }) => {
  const waterUsageTest = new UnitTest(canvasElement, 'unit', waterUsage);

  await waterUsageTest.selectedUnitToBeInTheDocument('gal');
  await waterUsageTest.visibleInputToHaveValue(
    waterUsageTest.convertDBValueToDisplayValue(3.785411795401, 'gal'),
  );
  await waterUsageTest.hiddenInputToHaveValue(3.785411795401);
};
