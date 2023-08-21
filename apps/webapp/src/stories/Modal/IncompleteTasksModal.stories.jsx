import React from 'react';
import IncompleteTaskModal from '../../components/Modals/IncompleteTaskModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/IncompleteTaskModal',
  decorators: componentDecorators,
  component: IncompleteTaskModal,
};

const Template = (args) => <IncompleteTaskModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
