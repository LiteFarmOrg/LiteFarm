import React from 'react';
import decorators from '../../config/Decorators';
import EnterPasswordPage from '../../../../components/Signup/EnterPasswordPage';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Signup/EnterPassword',
  decorators: decorators,
  component: EnterPasswordPage,
};

const Template = (args) => <EnterPasswordPage {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Not_Chrome = Template.bind({});
Not_Chrome.args = { isChrome: false };
Not_Chrome.parameters = {
  ...chromaticSmallScreen,
};
