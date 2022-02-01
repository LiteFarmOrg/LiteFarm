import React from 'react';
import decorators from '../Pages/config/Decorators';
import GoogleLoginButton from '../../containers/GoogleLoginButton';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/GoogleLoginButton',
  decorators: decorators,
  component: GoogleLoginButton,
};

const Template = (args) => <GoogleLoginButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
