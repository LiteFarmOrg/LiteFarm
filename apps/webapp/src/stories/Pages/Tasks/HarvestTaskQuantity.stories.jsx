import React from 'react';
import PureHarvestCompleteQuantity from '../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import decorator from '../config/Decorators';
import UnitTest from '../../../test-utils/storybook/unit';

export default {
  title: 'Form/Crop/Tasks/HarvestCompleteQuantity',
  component: PureHarvestCompleteQuantity,
  decorators: decorator,
};

const args = {
  onCancel: () => {},
  onGoBack: () => {},
  useHookFormPersist: () => ({}),
  persistedFormData: {},
};

const Template = (args) => <PureHarvestCompleteQuantity {...args} />;
export const MetricHarvestCompleteQuantity = Template.bind({});
MetricHarvestCompleteQuantity.args = {
  ...args,
  system: 'metric',
  task: {
    harvest_task: {
      projected_quantity: 1,
      projected_quantity_unit: 'kg',
    },
  },
};
MetricHarvestCompleteQuantity.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');
  await test.visibleInputToHaveValue(1);
  await test.hiddenInputToHaveValue(1);
  await test.selectedUnitToBeInTheDocument('kg');
};

export const ImperialHarvestCompleteQuantity = Template.bind({});
ImperialHarvestCompleteQuantity.args = {
  ...args,
  system: 'imperial',
  task: {
    harvest_task: {
      projected_quantity: 14.968536,
      projected_quantity_unit: 'lb',
    },
  },
};
ImperialHarvestCompleteQuantity.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');
  await test.visibleInputToHaveValue(33);
  await test.hiddenInputToHaveValue(14.968536);
  await test.selectedUnitToBeInTheDocument('lb');
};
