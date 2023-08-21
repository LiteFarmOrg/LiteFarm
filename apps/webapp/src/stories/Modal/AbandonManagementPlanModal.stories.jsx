import React from 'react';
import AbandonManagementPlanModal from '../../components/Modals/AbandonManagementPlanModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/AbandonManagementPlanModal',
  decorators: componentDecorators,
  component: AbandonManagementPlanModal,
};

const Template = (args) => <AbandonManagementPlanModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
