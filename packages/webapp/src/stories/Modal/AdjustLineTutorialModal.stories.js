import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import AdjustLineModal from '../../components/Map/Modals/AdjustLine';

export default {
  title: 'Components/Modals/AdjustLineModal',
  decorators: componentDecorators,
  component: AdjustLineModal,
};

const Template = (args) => <AdjustLineModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
