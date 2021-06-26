import React from 'react';
import PureBedPlanGuidance from '../../../components/Crop/BedPlan/BedPlanGuidance';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/BedPlanGuidance',
  component: PureBedPlanGuidance,
  decorators: decorators,
};

const Template = (args) => <PureBedPlanGuidance {...args} />;

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
