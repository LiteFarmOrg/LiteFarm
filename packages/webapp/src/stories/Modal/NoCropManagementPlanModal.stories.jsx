import React from 'react';
import { NoCropManagementPlanModal } from '../../components/Modals/NoCropManagementPlanModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/NoCropManagementPlanModal',
  decorators: componentDecorators,
  component: NoCropManagementPlanModal,
};

const Template = (args) => <NoCropManagementPlanModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
