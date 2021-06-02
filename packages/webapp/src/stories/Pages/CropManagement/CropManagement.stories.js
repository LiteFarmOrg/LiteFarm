import React from 'react';
import PureCropManagement from '../../../components/Crop/management';
import decorator from '../config/decorators';

export default {
  title: 'Form/Crop/Management',
  component: PureCropManagement,
  decorators: decorator,
};

const Template = (args) => <PureCropManagement {...args} />;

export const Management = Template.bind({});
Management.args = {
  history: {
    location: { pathname: '/crop/2/management' },
  },
  match: {
    params: {
      variety_id: 'variety_id',
    },
  },
  variety: {
    cropName: 'Carrot',
    varietyName: 'Nantes',
    supplierName: 'Buckerfields',
    supplier: 'Supplier 1',
  },
};
