import React from 'react';
import PureBedPlan from '../../../components/Crop/BedPlan';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/BedPlan',
  component: PureBedPlan,
  decorators: decorators,
};

const Template = (args) => <PureBedPlan {...args} />;

export const Management = Template.bind({});
Management.args = {
  onGoBack: () => {},
  handleContinue: () => {},
  onCancel: () => {},
  useHookFormPersist: () => {},
  persistedFormData: {},
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
};
