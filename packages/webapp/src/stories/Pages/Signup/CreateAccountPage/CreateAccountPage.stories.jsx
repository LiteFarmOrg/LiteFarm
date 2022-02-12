import React from 'react';
import decorators from '../../config/Decorators';
import PureCreateUserAccount from '../../../../components/CreateUserAccount';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Signup/CreateUserAccount',
  decorators: decorators,
  component: PureCreateUserAccount,
};

const Template = (args) => <PureCreateUserAccount {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  email: 'litefarm@litefarm.org',
  onSignUp: (data) => console.log(data),
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
