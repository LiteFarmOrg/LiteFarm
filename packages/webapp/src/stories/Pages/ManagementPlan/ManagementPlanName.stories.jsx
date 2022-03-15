import React from 'react';
import ManagementPlanName from '../../../components/Crop/ManagementPlanName';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/ManagementPlanName',
  decorators: decorators,
  component: ManagementPlanName,
};

const Template = (args) => <ManagementPlanName {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  onGoBack: () => {},
  onCancel: () => {},
  persistedFormData: {
    crop_management_plan: { planting_management_plans: { final: {}, initial: {} } },
  },
  managementPlanCount: 10,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
