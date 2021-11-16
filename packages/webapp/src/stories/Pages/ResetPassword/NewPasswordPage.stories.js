import React from 'react';
import decorators from '../config/decorators';

import PureResetPasswordAccount from '../../../components/PasswordResetAccount';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ResetPassword/NewPasswordPage',
  decorators: decorators,
  component: PureResetPasswordAccount,
};

const Template = (args) => <PureResetPasswordAccount {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
