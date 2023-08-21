import React from 'react';
import PureManagementPlanTile from '../../components/CropTile/ManagementPlanTile';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/CropTile/ManagementPlanTile',
  component: PureManagementPlanTile,
  decorators: componentDecorators,
};

const Template = (args) => (
  <div style={{ height: '140px' }}>
    <PureManagementPlanTile {...args} />
  </div>
);
export const Active = Template.bind({});
Active.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp`,
  },
  status: 'active',
};

export const Planned = Template.bind({});
Planned.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp`,
  },
  status: 'planned',
};

export const Past = Template.bind({});
Past.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp`,
  },
  status: 'past',
};

export const Selected = Template.bind({});
Selected.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    start_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp`,
  },
  status: 'past',
  isSelected: true,
};
