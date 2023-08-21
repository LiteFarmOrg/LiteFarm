import React from 'react';
import decorators from '../../config/Decorators';
import WelcomeScreen from '../../../../components/WelcomeScreen';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/1-WelcomeScreen',
  decorators: decorators,
  component: WelcomeScreen,
};

const Template = (args) => <WelcomeScreen {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
