import React from 'react';
import PureManagementPlanTile from '../../components/CropTile/ManagementPlanTile';
import { componentDecorators } from '../Pages/config/decorators';

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
    seed_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/carrot.webp`,
  },
  status: 'Active',
};

export const Planned = Template.bind({});
Planned.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    seed_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/carrot.webp`,
  },
  status: 'Planned',
};

export const Past = Template.bind({});
Past.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    seed_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/carrot.webp`,
  },
  status: 'Past',
};

export const Selected = Template.bind({});
Selected.args = {
  managementPlan: {
    crop_variety_name: 'Bolero',
    seed_date: '2020-12-25T15:02:31.440Z',
    crop_translation_key: 'CARROT',
    crop_variety_photo_url: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/carrot.webp`,
  },
  status: 'Past',
  isSelected: true,
};

//
// export const CropCount = Template.bind({});
// CropCount.args = {
//   children: <Semibold>Blueberry</Semibold>,
//   cropCount: {
//     active: 8,
//     planned: 8,
//     past: 8,
//   },
// };
