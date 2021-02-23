import React from 'react';
import ResetSuccessModal from '../../components/Modals/ResetPasswordSuccess';
import { componentDecoratorsWithoutPadding } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/ResetSuccessModal',
  component: ResetSuccessModal,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <ResetSuccessModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
