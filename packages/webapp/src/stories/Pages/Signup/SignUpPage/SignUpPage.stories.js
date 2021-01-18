import React from 'react';
import decorators from '../../config/decorators';
import PureCustomSignUp from '../../../../components/CustomSignUp';
import GoogleLoginButton from '../../../../containers/GoogleLoginButton';
export default {
  title: 'Form/Signup/SignUpPage',
  decorators: decorators,
  component: PureCustomSignUp,
};

const Template = (args) => <PureCustomSignUp {...args} />;

export const Primary = Template.bind({});
Primary.args = { GoogleLoginButton: <GoogleLoginButton /> };
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Not_Chrome = Template.bind({});
Not_Chrome.args = { GoogleLoginButton: <GoogleLoginButton />, isChrome: false };
Not_Chrome.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Invalid_token = Template.bind({});
Invalid_token.args = {
  GoogleLoginButton: <GoogleLoginButton />,
  isChrome: false,
  errorMessage: 'This invitation has already been used, please log in to access this farm',
};
Invalid_token.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
