import React from 'react';
import FileSizeExceedModal from '../../components/Modals/FileSizeExceedModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/FileSizeExceedModal',
  decorators: componentDecorators,
  component: FileSizeExceedModal,
};

const Template = (args) => <FileSizeExceedModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
