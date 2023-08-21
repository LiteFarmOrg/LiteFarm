import React from 'react';
import { PlantingTaskModal } from '../../components/Modals/PlantingTaskModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/PlantingTaskModal',
  decorators: componentDecorators,
  component: PlantingTaskModal,
};

const Template = (args) => <PlantingTaskModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
