import React from 'react';
import PureHarvestCompleteQuantity from '../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import decorator from '../config/Decorators';

export default {
  title: 'Form/Crop/Tasks/HarvestCompleteQuantity',
  component: PureHarvestCompleteQuantity,
  decorators: decorator,
};

const Template = (args) => <PureHarvestCompleteQuantity {...args} />;

export const HarvestCompleteQuantity = Template.bind({});
HarvestCompleteQuantity.args = {
  onCancel: () => {},
  onGoBack: () => {},
  system: 'metric',
  useHookFormPersist: () => ({}),
  persistedFormData: {},
  task: {
    harvest_task: {
      projected_quantity: 1,
    },
  },
};
