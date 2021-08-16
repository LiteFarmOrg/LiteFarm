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
    location: { pathname: '/crop/variety_id/management' },
  },
  match: {
    params: {
      variety_id: 'variety_id',
    },
  },
  variety: {
    crop_translation_key: 'Blueberry',
    crop_variety_name: 'Nantes',
    supplier: 'Buckerfields',
    crop_variety_photo_url:
      'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/blueberry.webp',
  },
};
