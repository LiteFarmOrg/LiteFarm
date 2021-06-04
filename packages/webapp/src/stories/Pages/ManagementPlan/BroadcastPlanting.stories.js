import React from 'react';
import PureBroadcastPlan from '../../../components/BroadcastPlan';
import decorators from '../config/decorators';

export default {
  title: 'Form/ManagementPlan/BroadcastPlan',
  component: PureBroadcastPlan,
  decorators: decorators,
};

const Template = (args) => <PureBroadcastPlan {...args} />;

export const Management = Template.bind({});
Management.args = {
  onGoBack: () =>{},
  handleContinue: () =>{},
  onCancel: () =>{},
  persistedForm: {}
};
