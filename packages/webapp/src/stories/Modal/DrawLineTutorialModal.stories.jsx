import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import DrawLineModal from '../../components/Map/Modals/DrawLine';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/DrawLineModal',
  decorators: componentDecorators,
  component: DrawLineModal,
};

const Template = (args) => <DrawLineModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
