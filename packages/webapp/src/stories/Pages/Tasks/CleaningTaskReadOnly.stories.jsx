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
    assignee: {
      user_id: '7212c8c6-a0b6-11ed-be24-e66db4bef552',
      farm_id: '7ec07118-a0b6-11ed-88a9-e66db4bef552',
      role_id: 1,
      has_consent: true,
      status: 'Active',
      consent_version: '4.0',
      wage: { type: 'hourly', amount: 0 },
      step_one: true,
      step_one_end: '2023-01-30T15:55:18.965Z',
      step_two: true,
      step_two_end: '2023-01-30T15:55:24.125Z',
      step_three: true,
      step_three_end: '2023-01-30T15:55:26.752Z',
      step_four: true,
      step_four_end: '2023-01-30T15:55:43.280Z',
      step_five: true,
      step_five_end: '2023-01-30T15:55:44.061Z',
      wage_do_not_ask_again: null,
      first_name: 'Sayaka',
      last_name: 'Ono',
      profile_picture: null,
      email: 'sono@litefarm.org',
      phone_number: null,
      user_address: null,
      notification_setting: {
        alert_pest: true,
        alert_weather: true,
        alert_worker_finish: true,
        alert_before_planned_date: true,
        alert_action_after_scouting: true,
      },
      language_preference: 'en',
      status_id: 1,
      gender: 'FEMALE',
      birth_year: null,
      do_not_email: false,
      sandbox_user: false,
      farm_name: 'Vancouver farm',
      address: '49.250945, -123.238492',
      units: { currency: 'CAD', measurement: 'imperial' },
      grid_points: { lat: 49.250945, lng: -123.238492 },
      farm_phone_number: null,
      sandbox_farm: false,
      country_id: 37,
      owner_operated: true,
      default_initial_location_id: null,
      utc_offset: null,
      owner_name: 'Sayaka Gmail',
    },
    pinCoordinates: [],
    managementPlansByPinCoordinate: {},
    locationsById: {
      '043ab9ee-b3da-11ed-9fd8-e66db4bef551': {
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
  await waterUsageTest.testSelectedUnit('ml');
  await waterUsageTest.testVisibleValue(
    waterUsageTest.convertDBValueToDisplayValue(3.785411795401, 'ml'),
  );
  await waterUsageTest.testHiddenValue(3.785411795401);
};

export const Imperial = Template.bind({});
Imperial.args = { ...args, system: 'imperial' };
Imperial.play = async ({ canvasElement }) => {
  const waterUsageTest = new UnitTest(canvasElement, 'unit', waterUsage);

  await waterUsageTest.testSelectedUnit('gal');
  await waterUsageTest.testVisibleValue(
    waterUsageTest.convertDBValueToDisplayValue(3.785411795401, 'gal'),
  );
  await waterUsageTest.testHiddenValue(3.785411795401);
};
