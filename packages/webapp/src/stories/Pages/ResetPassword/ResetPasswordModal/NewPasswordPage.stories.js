import React from 'react';
import decorators from '../../config/decorators';

import PureResetPasswordAccount from '../../../../components/PasswordResetAccount';

export default {
  title: 'Form/ResetPassword/NewPasswordPage',
  decorators: decorators,
  component: PureResetPasswordAccount,
};

const Template = (args) => <PureResetPasswordAccount {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
