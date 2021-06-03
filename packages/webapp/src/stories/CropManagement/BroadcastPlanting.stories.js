import React from 'react';
import PureBroadcastPlan from '../../components/BroadcastPlan';
import { componentDecorators } from '../Pages/config/decorators';
import decorators from '../Pages/config/decorators';

export default {
  title: 'Form/Management/BroadcastPlan',
  component: PureBroadcastPlan,
  decorators: decorators,
};

const Template = (args) => <PureBroadcastPlan {...args} />;

export const Management = Template.bind({});
Management.args = {};
