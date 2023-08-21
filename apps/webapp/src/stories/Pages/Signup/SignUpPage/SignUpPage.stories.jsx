import React from 'react';
import decorators from '../../config/Decorators';
import PureCustomSignUp from '../../../../components/CustomSignUp';
import GoogleLoginButton from '../../../../containers/GoogleLoginButton';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Signup/SignUpPage',
  decorators: decorators,
  component: PureCustomSignUp,
};

const Template = (args) => <PureCustomSignUp {...args} />;

export const Primary = Template.bind({});
Primary.args = { GoogleLoginButton: <GoogleLoginButton /> };
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const Not_Chrome = Template.bind({});
Not_Chrome.args = { GoogleLoginButton: <GoogleLoginButton />, isChrome: false };
Not_Chrome.parameters = {
  ...chromaticSmallScreen,
};

export const Invalid_token = Template.bind({});
Invalid_token.args = {
  GoogleLoginButton: <GoogleLoginButton />,
  isChrome: false,
  errorMessage: 'This invitation has already been used, please log in to access this farm',
};
Invalid_token.parameters = {
  ...chromaticSmallScreen,
};
