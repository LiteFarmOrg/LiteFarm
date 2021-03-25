import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import DrawAreaModal from '../../components/Map/Modals/DrawArea';

export default {
  title: 'Components/Modals/DrawAreaModal',
  decorators: componentDecorators,
  component: DrawAreaModal,
};

const Template = (args) => <DrawAreaModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
