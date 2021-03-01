import React from 'react';
import ExportMapModal from '../../components/Modals/ExportMapModal';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/ExportMapModal',
  decorators: componentDecorators,
  component: ExportMapModal,
};

const Template = (args) => <ExportMapModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
