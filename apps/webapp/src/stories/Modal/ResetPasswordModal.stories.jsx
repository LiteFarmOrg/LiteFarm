import React from 'react';
import ResetPasswordModal from '../../components/Modals/ResetPassword';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/ResetPasswordModal',
  decorators: componentDecorators,
  component: ResetPasswordModal,
};

const Template = (args) => <ResetPasswordModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
