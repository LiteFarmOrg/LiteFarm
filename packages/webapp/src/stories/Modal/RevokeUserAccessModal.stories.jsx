import React from 'react';
import RevokeUserAccessModal from '../../components/Modals/RevokeUserAccessModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/RevokeUserAccessModal',
  decorators: componentDecorators,
  component: RevokeUserAccessModal,
};

const Template = (args) => <RevokeUserAccessModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  dismissModal: () => {
    console.log('dismissing modal');
  },
  onRevoke: () => {
    console.log('revoke access');
  },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
