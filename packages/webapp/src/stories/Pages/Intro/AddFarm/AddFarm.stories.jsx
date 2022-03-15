import React from 'react';
import decorators from '../../config/Decorators';
import AddFarm from '../../../../containers/AddFarm';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/2-AddFarm',
  decorators: decorators,
  component: AddFarm,
};

const Template = (args) => <AddFarm {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
