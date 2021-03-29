import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import AdjustAreaModal from '../../components/Map/Modals/AdjustArea';

export default {
  title: 'Components/Modals/AdjustAreaModal',
  decorators: componentDecorators,
  component: AdjustAreaModal,
};

const Template = (args) => <AdjustAreaModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
