import React from 'react';
import ManagementPlanName from '../../../components/Crop/ManagementPlanName';
import decorators from '../config/decorators';
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
  persistedFormData: {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
