import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import AdjustDrawingModal from '../../components/Map/Modals/AdjustDrawing';

export default {
  title: 'Components/Modals/AdjustDrawingModal',
  decorators: componentDecorators,
  component: AdjustDrawingModal,
};

const Template = (args) => <AdjustDrawingModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
