import React from 'react';
import PureOutroSplash from '../../../../components/Outro';
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/6-Outro',
  decorators: decorators,
  component: PureOutroSplash,
};

const Template = (args) => <PureOutroSplash {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  redirectFinish: () => {},
  onGoBack: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
