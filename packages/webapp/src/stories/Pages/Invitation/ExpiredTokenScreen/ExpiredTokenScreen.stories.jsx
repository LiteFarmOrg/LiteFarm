import React from 'react';
import decorators from '../../config/Decorators';
import ExpiredTokenScreen from '../../../../components/ExpiredTokenScreen';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Page/ExpiredToken',
  decorators: decorators,
  component: ExpiredTokenScreen,
};

const Template = (args) => <ExpiredTokenScreen {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  text: 'This link has expired. Please ask for a new invite link.',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const ResetPassword = Template.bind({});
ResetPassword.args = {
  text: 'This link has expired.',
  linkText: 'Send new password link.',
};
ResetPassword.parameters = {
  ...chromaticSmallScreen,
};
