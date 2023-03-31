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

const cleaningTaskArgs = {
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

export const MetricCleaningTask = Template.bind({});
MetricCleaningTask.args = cleaningTaskArgs;
MetricCleaningTask.parameters = {
  ...chromaticSmallScreen,
};
MetricCleaningTask.play = async ({ canvasElement }) => {
  const quantityTest = new UnitTest(canvasElement, 'unit');
  await quantityTest.testNoInput();
  await quantityTest.testSelectedUnit('l');
};

export const ImperialCleaningTask = Template.bind({});
ImperialCleaningTask.args = { ...cleaningTaskArgs, system: 'imperial' };
ImperialCleaningTask.parameters = {
  ...chromaticSmallScreen,
};
ImperialCleaningTask.play = async ({ canvasElement }) => {
  const quantityTest = new UnitTest(canvasElement, 'unit');
  await quantityTest.testNoInput();
  await quantityTest.testSelectedUnit('gal');
};
