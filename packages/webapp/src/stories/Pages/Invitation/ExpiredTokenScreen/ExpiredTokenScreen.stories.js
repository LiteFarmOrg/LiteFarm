import React from 'react';
import decorators from '../../config/decorators';
import ExpiredTokenScreen from '../../../../components/ExpiredTokenScreen';

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
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const ResetPassword = Template.bind({});
ResetPassword.args = {
  text: 'This link has expired.',
  linkText: 'Send new password link.',
};
ResetPassword.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
