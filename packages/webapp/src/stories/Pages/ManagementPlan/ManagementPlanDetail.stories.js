import React from 'react';
import PureManagementTasks from '../../../components/Crop/ManagementDetail/ManagementPlanTasks';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/Detail',
  decorators: decorators,
  component: PureManagementTasks,
};

const Template = (args) => <PureManagementTasks {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  onBack: () => {},
  onCompleted: () => {},
  variety: {
    crop_translation_key: 'Crop',
    crop_variety_name: 'Variety',
    crop_variety_photo_url: '',
    supplier: 'Supplier',
  },
  plan: {
    name: 'name',
    notes: 'notes',
  },
  isAdmin: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
