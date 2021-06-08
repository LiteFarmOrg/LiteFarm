import React from 'react';
import PureBroadcastPlan from '../../../components/Crop/BroadcastPlan';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/BroadcastPlan',
  component: PureBroadcastPlan,
  decorators: decorators,
};

const Template = (args) => <PureBroadcastPlan {...args} />;

export const Management = Template.bind({});
Management.args = {
  onGoBack: () => {},
  handleContinue: () => {},
  onCancel: () => {},
  persistedForm: {},
  system: 'metric',
  locationSize: 2000,
  yieldPerArea: 30,
};
