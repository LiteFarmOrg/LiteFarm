import React from 'react';
import decorators from '../../config/decorators';
import PureResetPassword from '../../../../components/ResetPassword';

export default {
  title: 'Form/ResetPassword/ResetPasswordModal',
  decorators: decorators,
  component: PureResetPassword,
};

const Template = (args) => <PureResetPassword {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};