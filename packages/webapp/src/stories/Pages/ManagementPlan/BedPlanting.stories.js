import React from 'react';
import PureBedPlan from '../../../components/Crop/BedPlan/BedPlan';
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
  onCancel: () => {},
  handleContinue: () => {},
  match: {},
  history: {},
  system: 'metric',
  crop_variety: { average_seed_weight: 10, yield_per_plant: 10 },

  useHookFormPersist: () => {},
  persistedFormData: {},
  locationSize: 2000,
  yieldPerArea: 30,
};
