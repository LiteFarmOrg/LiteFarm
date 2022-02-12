import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import DrawAreaModal from '../../components/Map/Modals/DrawArea';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/DrawAreaModal',
  decorators: componentDecorators,
  component: DrawAreaModal,
};

const Template = (args) => <DrawAreaModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
