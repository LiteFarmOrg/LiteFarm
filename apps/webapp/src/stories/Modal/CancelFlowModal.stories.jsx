import React from 'react';
import CancelFlowModal from '../../components/Modals/CancelFlowModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/CancelFlowModal',
  decorators: componentDecorators,
  component: CancelFlowModal,
};

const Template = (args) => <CancelFlowModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  flow: 'MANAGEMENT_PLAN',
  dismissModal: () => {
    console.log('dismissing modal');
  },
  handleCancel: () => {
    console.log('cancelling flow');
  },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
