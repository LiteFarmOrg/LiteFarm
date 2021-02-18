import React from 'react';
import ResetSuccessModal from '../../components/Modals/ResetPasswordSuccess';

export default {
  title: 'Components/Modals/ResetSuccessModal',
  component: ResetSuccessModal,
  decorators: [(story) => <div>{story()}</div>],
};

const Template = (args) => <ResetSuccessModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
