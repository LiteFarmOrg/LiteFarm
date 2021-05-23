import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import DrawLineModal from '../../components/Map/Modals/DrawLine';

export default {
  title: 'Components/Modals/DrawLineModal',
  decorators: componentDecorators,
  component: DrawLineModal,
};

const Template = (args) => <DrawLineModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
