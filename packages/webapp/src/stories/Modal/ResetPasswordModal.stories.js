import React from 'react';
import ResetPasswordModal from '../../components/Modals/ResetPassword';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/ResetPasswordModal',
  decorators: componentDecorators,
  component: ResetPasswordModal,
};

const Template = (args) => <ResetPasswordModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
