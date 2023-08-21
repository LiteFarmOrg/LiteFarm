import React from 'react';
import EditCropVarietyModal from '../../components/Modals/EditCropVarietyModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/EditCropVarietyModal',
  decorators: componentDecorators,
  component: EditCropVarietyModal,
};

const Template = (args) => <EditCropVarietyModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  dismissModal: () => {
    console.log('dismissing modal');
  },
  handleEdit: () => {
    console.log('push to edit crop');
  },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
