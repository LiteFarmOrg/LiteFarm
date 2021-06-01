import React from 'react';
import decorators from '../config/decorators';
import ChooseFarm from '../../../containers/ChooseFarm/';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/ChooseFarm',
  decorators: decorators,
  component: ChooseFarm,
};

const Template = (args) => <ChooseFarm {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
