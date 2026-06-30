import React from 'react';
import { authenticatedDecorators } from '../config/Decorators';
import PureHome from '../../../components/Home';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Home/PureHome',
  decorators: authenticatedDecorators,
  component: PureHome,
};

const Template = (args) => <PureHome {...args} />;

export const Default = Template.bind({});
Default.args = {
  first_name: 'User Name',
  farmName: 'Sunrise Farm',
  date: 'Sunday 6 Apr 2026',
};
Default.parameters = {
  ...chromaticSmallScreen,
};
