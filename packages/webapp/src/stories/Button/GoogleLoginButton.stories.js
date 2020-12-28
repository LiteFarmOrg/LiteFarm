import React from 'react';
import decorators from '../Pages/config/decorators';
import GoogleLoginButton from '../../containers/GoogleLoginButton';

export default {
  title: 'Components/GoogleLoginButton',
  decorators: decorators,
  component: GoogleLoginButton,
};

const Template = (args) => <GoogleLoginButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
