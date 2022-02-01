import React from 'react';
import PreparingExportModal from '../../components/Modals/PreparingExportModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/PreparingExportModal',
  decorators: componentDecorators,
  component: PreparingExportModal,
};

const Template = (args) => <PreparingExportModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
