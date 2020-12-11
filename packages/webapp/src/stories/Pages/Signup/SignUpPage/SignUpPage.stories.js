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
