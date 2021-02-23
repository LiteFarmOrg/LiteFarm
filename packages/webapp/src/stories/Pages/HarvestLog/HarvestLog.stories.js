import React from 'react';
import decorators from '../config/decorators';
import PureHarvestLog from '../../../components/Logs/HarvestLog';

export default {
  title: 'Form/HarvestLog',
  decorators: decorators,
  component: PureHarvestLog,
};

const Template = (args) => <PureHarvestLog {...args} />;

export const HelpMain = Template.bind({});
