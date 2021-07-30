import React from 'react';
import PureManagementDetail from '../../../components/Crop/ManagementDetail';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/ManagementPlan/Detail',
  decorators: decorators,
  component: PureManagementDetail,
};

const Template = (args) => <PureManagementDetail {...args} />;

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
  isAdmin: true,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
