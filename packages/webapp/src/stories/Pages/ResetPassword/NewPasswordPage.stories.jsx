import React from 'react';
import decorators from '../config/Decorators';

import PureResetPasswordAccount from '../../../components/PasswordResetAccount';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ResetPassword/NewPasswordPage',
  decorators: decorators,
  component: PureResetPasswordAccount,
};

const Template = (args) => <PureResetPasswordAccount setAuth={() => {}} {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
