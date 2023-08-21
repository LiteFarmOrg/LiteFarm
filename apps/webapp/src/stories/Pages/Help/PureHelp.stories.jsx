import React from 'react';
import { authenticatedDecorators } from '../config/Decorators';
import PureHelpRequestPage from '../../../components/Help';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Help/PureHelp',
  decorators: authenticatedDecorators,
  component: PureHelpRequestPage,
};

const Template = (args) => <PureHelpRequestPage {...args} />;

export const HelpMain = Template.bind({});
HelpMain.args = {};
HelpMain.parameters = {
  ...chromaticSmallScreen,
};
