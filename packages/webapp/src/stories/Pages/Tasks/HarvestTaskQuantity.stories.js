import React from 'react';
import PureHarvestCompleteQuantity from '../../../components/Task/TaskComplete/HarvestComplete/Quantity';
import decorator from '../config/decorators';

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
  useHookFormPersist: () => {},
  persistedFormData: {},
};
