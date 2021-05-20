import React from 'react';
import PureCropManagement from '../../components/Crop/management';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Crop/Management',
  component: PureCropManagement,
  decorators: componentDecorators,
};

const Template = (args) => <PureCropManagement {...args} />;

export const Management = Template.bind({});
Management.args = {
  history: {
    location: { pathname: '/crop/2/management' },
  },
  crop: {
    cropName: 'Carrot',
    varietyName: 'Nantes',
    supplierName: 'Buckerfields',
  },
};
