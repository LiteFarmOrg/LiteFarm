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
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import PureTaskDetails from '../../../../components/Task/PureTaskDetails';
import UnitTest from '../../../../test-utils/storybook/unit';

export default {
  title: 'Page/Task/AddIrrigationTask',
  decorators: decorators,
  component: PureTaskDetails,
};

const Template = (args) => <PureTaskDetails {...args} />;

const args = {
  handleGoBack: () => console.log('handleGoBack called'),
  onSubmit: () => console.log('onSave called'),
  handleCancel: () => console.log('handleCancel called'),
  onError: () => console.log('onError called'),
  useHookFormPersist: () => ({}),
  persistedFormData: {
    task_type_id: 17,
    due_date: '2023-03-31',
    locations: [{ location_id: '91bd7698-a0b7-11ed-be24-e66db4bef552' }],
    show_wild_crop: false,
    managementPlans: [],
    irrigation_task: {
      default_irrigation_task_type_location: false,
      default_irrigation_task_type_measurement: false,
      irrigation_type_name: {
        value: 'CHANNEL',
        label: 'CHANNEL',
        default_measuring_type: 'VOLUME',
        irrigation_type_id: 1,
      },
      measuring_type: 'VOLUME',
      estimated_water_usage_unit: { label: 'gal', value: 'gal' },
    },
  },
  selectedTaskType: {
    task_type_id: 17,
    task_name: 'Irrigation',
    task_translation_key: 'IRRIGATION_TASK',
    farm_id: null,
    deleted: false,
  },
  persistedPaths: [],
  products: [],
  system: 'metric',
  managementPlanByLocations: {},
};

export const MetricIrrigationTask = Template.bind({});
MetricIrrigationTask.args = args;
MetricIrrigationTask.parameters = {
  ...chromaticSmallScreen,
};
MetricIrrigationTask.play = async ({ canvasElement }) => {
  const waterUsageTest = new UnitTest(canvasElement, 'unit');
  await waterUsageTest.inputNotToHaveValue();
  await waterUsageTest.selectedUnitToBeInTheDocument('l');
};

export const ImperialIrrigationTask = Template.bind({});
ImperialIrrigationTask.args = { ...args, system: 'imperial' };
ImperialIrrigationTask.parameters = {
  ...chromaticSmallScreen,
};
ImperialIrrigationTask.play = async ({ canvasElement }) => {
  const waterUsageTest = new UnitTest(canvasElement, 'unit');
  await waterUsageTest.inputNotToHaveValue();
  await waterUsageTest.selectedUnitToBeInTheDocument('gal');
};
