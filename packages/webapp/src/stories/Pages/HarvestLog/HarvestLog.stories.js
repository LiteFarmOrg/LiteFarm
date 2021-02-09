import React from 'react';
import decorators from '../config/decorators';
import PureHarvestLog from '../../../components/Logs/HarvestLog';

export default {
  title: 'Form/HarvestLog/Main',
  decorators: decorators,
  component: PureHarvestLog,
};

const Template = (args) => <PureHarvestLog {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {};
