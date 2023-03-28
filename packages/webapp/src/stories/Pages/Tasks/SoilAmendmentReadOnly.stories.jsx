import React from 'react';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import decorator from '../config/Decorators';
import UnitTest from '../../../test-utils/storybook/unit';
import { soilAmounts } from '../../../util/convert-units/unit';

export default {
  title: 'Form/Crop/Tasks/SoilAmendmentTaskReadOnly',
  component: PureTaskReadOnly,
  decorators: decorator,
};

const Template = (args) => <PureTaskReadOnly {...args} />;

const args = {
  task: {
    task_id: 73,
    due_date: '2023-02-17T00:00:00.000',
    owner_user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
    notes: null,
    completion_notes: null,
    task_type_id: 6,
    assignee_user_id: '7147bd30-a646-11ed-bdb8-e66db4bef552',
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
        name: 'First garden',
        notes: '',
        location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
        deleted: false,
        location_defaults: {
          location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
          estimated_flow_rate: null,
          estimated_flow_rate_unit: null,
          application_depth: null,
          application_depth_unit: null,
          irrigation_type_id: 2,
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
    managementPlans: [],
    abandonment_reason: null,
    other_abandonment_reason: null,
    abandonment_notes: null,
    location_defaults: [
      {
        location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
        estimated_flow_rate: null,
        estimated_flow_rate_unit: null,
        application_depth: null,
        application_depth_unit: null,
        irrigation_type_id: 2,
      },
    ],
    pinned_at: null,
    taskType: {
      task_type_id: 6,
      task_name: 'Soil Amendment',
      task_translation_key: 'SOIL_AMENDMENT_TASK',
      farm_id: null,
      deleted: false,
    },
    soil_amendment_task: {
      product: {
        product_id: 31,
        name: 'new product',
        product_translation_key: null,
        supplier: 'supplier',
        on_permitted_substances_list: 'NOT_SURE',
        type: 'soil_amendment_task',
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
      },
      other_purpose: null,
      product_id: 31,
      product_quantity: 11,
      product_quantity_unit: 'kg',
      purpose: 'structure',
      task_id: 73,
    },
    assignee: {
      user_id: '7147bd30-a646-11ed-bdb8-e66db4bef552',
      farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
      role_id: 3,
      has_consent: true,
      status: 'Active',
      consent_version: '4.0',
      wage: { type: 'hourly', amount: 25 },
      step_one: true,
      step_one_end: null,
      step_two: true,
      step_two_end: null,
      step_three: true,
      step_three_end: '2023-02-06T18:11:26.060Z',
      step_four: true,
      step_four_end: null,
      step_five: true,
      step_five_end: null,
      wage_do_not_ask_again: null,
      first_name: 'Worker',
      last_name: '3',
      profile_picture: null,
      email: 'sono+worker3@litefarm.org',
      phone_number: null,
      user_address: null,
      language_preference: 'en',
      status_id: 1,
      do_not_email: false,
      sandbox_user: false,
      farm_name: 'Vancouver farm',
      address: '49.250945, -123.238492',
      units: { currency: 'CAD', measurement: 'metric' },
      grid_points: { lat: 49.250945, lng: -123.238492 },
      farm_phone_number: null,
      sandbox_farm: false,
      country_id: 37,
      owner_operated: true,
      default_initial_location_id: null,
      utc_offset: null,
    },
    pinCoordinates: [],
    managementPlansByPinCoordinate: {},
    locationsById: {
      '91bd7698-a0b7-11ed-be24-e66db4bef552': {
        farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
        name: 'First garden',
        notes: '',
        location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
        deleted: false,
        location_defaults: {
          location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552',
          estimated_flow_rate: null,
          estimated_flow_rate_unit: null,
          application_depth: null,
          application_depth_unit: null,
          irrigation_type_id: 2,
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
  const quantityTest = new UnitTest(canvasElement, 'unit');
  await quantityTest.testVisibleValue(11);
  await quantityTest.testHiddenValue(11);
  await quantityTest.testSelectedUnit('kg');
};

export const Imperial = Template.bind({});
Imperial.args = { ...args, system: 'imperial' };
Imperial.play = async ({ canvasElement }) => {
  const quantityTest = new UnitTest(canvasElement, 'unit', soilAmounts);
  await quantityTest.testVisibleValue(quantityTest.convertDBValueToDisplayValue(11, 'lb'));
  await quantityTest.testHiddenValue(11);
  await quantityTest.testSelectedUnit('lb');
};
