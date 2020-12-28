import React from 'react';
import { PureResetPasswordComponent } from '../../../../components/Modals/ResetPassword';

export default {
  title: 'Components/Modals/ResetPasswordModal',
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
  component: PureResetPasswordComponent,
};

const Template = (args) => <PureResetPasswordComponent {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
