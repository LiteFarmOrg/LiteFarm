import React from 'react';
import ResetPasswordModal from '../../components/Modals/ResetPassword';

export default {
  title: 'Components/Modals/ResetPasswordModal',
  decorators: [(story) => <div style={{ padding: '3rem' }}>{story()}</div>],
  component: ResetPasswordModal,
};

const Template = (args) => <ResetPasswordModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
