import React from 'react';
import FileSizeExceedModal from '../../components/Modals/FileSizeExceedModal';
import { componentDecorators } from '../Pages/config/decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/FileSizeExceedModal',
  decorators: componentDecorators,
  component: FileSizeExceedModal,
};

const Template = (args) => <FileSizeExceedModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  dismissModal: () => {
    console.log('dismissing modal');
  },
  handleRetry: () => {
    console.log('retry upload');
  },
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
