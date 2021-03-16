import React from 'react';
import AdjustModal from '../../components/Modals/AdjustModal';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/AdjustModal',
  decorators: componentDecorators,
  component: AdjustModal,
};

const Template = (args) => <AdjustModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
