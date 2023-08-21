import React from 'react';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/ExportMapModal',
  decorators: componentDecorators,
  component: ExportMapModal,
};

const Template = (args) => <ExportMapModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
