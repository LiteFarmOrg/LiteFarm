import React from 'react';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import decorator from '../config/Decorators';
import UnitTest from '../../../test-utils/storybook/unit';
import { harvestAmounts } from '../../../util/convert-units/unit';

export default {
  title: 'Form/Crop/Tasks/HarvestingTaskReadOnly',
  component: PureTaskReadOnly,
  decorators: decorator,
};

const Template = (args) => <PureTaskReadOnly {...args} />;

const args = {
  task: {
    task_id: 127,
    due_date: '2023-03-28T00:00:00.000',
    owner_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    notes: 'harvest 33 lb',
    task_type_id: 8,
    assignee_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    wage_at_moment: 0,
    locations: [
      {
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
        name: 'LiteFarm garden',
        notes: '',
        location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
        deleted: false,
        location_defaults: {
          location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
          estimated_flow_rate: null,
          estimated_flow_rate_unit: null,
          application_depth: null,
          application_depth_unit: null,
          irrigation_type_id: 19,
        },
        figure_id: '91be84d4-a0b7-11ed-be24-e66db4bef552',
        type: 'garden',
        total_area: 43815,
        total_area_unit: 'ha',
        grid_points: [
          { lat: 49.258605926335534, lng: -123.24441431750488 },
          { lat: 49.25925011822781, lng: -123.24244021166992 },
          { lat: 49.257205480170306, lng: -123.24072359790038 },
          { lat: 49.2564772324602, lng: -123.2428693651123 },
        ],
        perimeter: 858,
        perimeter_unit: 'm',
        station_id: null,
        organic_status: 'Non-Organic',
        transition_date: null,
      },
    ],
    completion_notes: '',
    coordinates: null,
    duration: 15,
    happiness: 5,
    complete_date: '2023-03-30T00:00:00.000',
    late_time: null,
    for_review_time: null,
    abandon_date: null,
    abandonment_reason: null,
    other_abandonment_reason: null,
    abandonment_notes: null,
    taskType: {
      task_type_id: 8,
      task_name: 'Harvesting',
      task_translation_key: 'HARVEST_TASK',
      farm_id: null,
      deleted: false,
    },
    harvest_task: {
      harvest_everything: false,
      projected_quantity: 14.968536,
      projected_quantity_unit: 'lb',
      task_id: 127,
      actual_quantity: 15.87572,
      actual_quantity_unit: 'lb',
      harvest_use: [
        {
          harvest_use_id: 8,
          task_id: 127,
          harvest_use_type_id: 1,
          quantity: 13.60776,
          quantity_unit: 'lb',
        },
        {
          harvest_use_id: 9,
          task_id: 127,
          harvest_use_type_id: 3,
          quantity: 2.26796,
          quantity_unit: 'lb',
        },
      ],
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
  harvestUseTypes: [
    {
      harvest_use_type_id: 1,
      harvest_use_type_name: 'Sales',
      farm_id: null,
      harvest_use_type_translation_key: 'SALES',
    },
    {
      harvest_use_type_id: 3,
      harvest_use_type_name: 'Animal Feed',
      farm_id: null,
      harvest_use_type_translation_key: 'ANIMAL_FEED',
    },
  ],
  maxZoomRef: { current: 19 },
  getMaxZoom: () => 19,
};

export const Metric = Template.bind({});
Metric.args = { ...args, system: 'metric' };
Metric.play = async ({ canvasElement }) => {
  const harvestQuantityTest = new UnitTest(canvasElement, 'harvest-quantity', harvestAmounts);
  await harvestQuantityTest.testSelectedUnit('kg');
  await harvestQuantityTest.testVisibleValue(14.97);
  await harvestQuantityTest.testHiddenValue(14.968536);
  await harvestQuantityTest.testDisabledStatus();

  const harvestUseQuantityTest0 = new UnitTest(
    canvasElement,
    'harvestuse-quantity-0',
    harvestAmounts,
  );
  await harvestUseQuantityTest0.testSelectedUnit('kg');
  await harvestUseQuantityTest0.testVisibleValue(13.61);
  await harvestUseQuantityTest0.testHiddenValue(13.60776);
  await harvestUseQuantityTest0.testDisabledStatus();

  const harvestUseQuantityTest1 = new UnitTest(
    canvasElement,
    'harvestuse-quantity-1',
    harvestAmounts,
  );
  await harvestUseQuantityTest1.testSelectedUnit('kg');
  await harvestUseQuantityTest1.testVisibleValue(2.27);
  await harvestUseQuantityTest1.testHiddenValue(2.26796);
  await harvestUseQuantityTest1.testDisabledStatus();
};

export const Imperial = Template.bind({});
Imperial.args = { ...args, system: 'imperial' };
Imperial.play = async ({ canvasElement }) => {
  const harvestQuantityTest = new UnitTest(canvasElement, 'harvest-quantity', harvestAmounts);
  await harvestQuantityTest.testSelectedUnit('lb');
  await harvestQuantityTest.testVisibleValue(
    harvestQuantityTest.convertDBValueToDisplayValue(14.968536, 'lb'),
  );
  await harvestQuantityTest.testHiddenValue(14.968536);
  await harvestQuantityTest.testDisabledStatus();

  const harvestUseQuantityTest0 = new UnitTest(
    canvasElement,
    'harvestuse-quantity-0',
    harvestAmounts,
  );
  await harvestUseQuantityTest0.testSelectedUnit('lb');
  await harvestUseQuantityTest0.testVisibleValue(
    harvestQuantityTest.convertDBValueToDisplayValue(13.60776, 'lb'),
  );
  await harvestUseQuantityTest0.testHiddenValue(13.60776);
  await harvestUseQuantityTest0.testDisabledStatus();

  const harvestUseQuantityTest1 = new UnitTest(
    canvasElement,
    'harvestuse-quantity-1',
    harvestAmounts,
  );
  await harvestUseQuantityTest1.testSelectedUnit('lb');
  await harvestUseQuantityTest1.testVisibleValue(
    harvestQuantityTest.convertDBValueToDisplayValue(2.26796, 'lb'),
  );
  await harvestUseQuantityTest1.testHiddenValue(2.26796);
  await harvestUseQuantityTest1.testDisabledStatus();
};
