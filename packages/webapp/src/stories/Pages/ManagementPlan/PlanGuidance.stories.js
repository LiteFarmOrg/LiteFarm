import React from 'react';
import PurePlanGuidance from '../../../components/Crop/BedPlan/BedPlanGuidance';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/PlanGuidance',
  component: PurePlanGuidance,
  decorators: decorators,
};

const Template = (args) => <PurePlanGuidance {...args} />;

export const Beds = Template.bind({});
Beds.args = {
  onGoBack: () => {},
  handleContinue: () => {},
  onCancel: () => {},
  useHookFormPersist: () => {},
  persistedFormData: {},
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isBed: true,
};


export const Rows = Template.bind({});
Rows.args = {
  onGoBack: () => {},
  handleContinue: () => {},
  onCancel: () => {},
  useHookFormPersist: () => {},
  persistedFormData: {},
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
  isBed: false,
};
