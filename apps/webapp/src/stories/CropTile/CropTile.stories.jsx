import React from 'react';
import PureCropTile from '../../components/CropTile';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/CropTile/CropTile',
  component: PureCropTile,
  decorators: componentDecorators,
};

const Template = (args) => (
  <div style={{ height: '140px' }}>
    <PureCropTile {...args} />
  </div>
);

export const Variety = Template.bind({});
Variety.args = {
  title: 'Blueberry',
  src: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp`,
  alt: 'blueberry',
};

export const CropTemplate = Template.bind({});
CropTemplate.args = {
  title: 'Blueberry',
  src: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp`,
  alt: 'blueberry',
  isCropTemplate: true,
};

export const WithManagementPlan = Template.bind({});
WithManagementPlan.args = {
  title: 'Blueberry',
  cropCount: {
    active: 8,
    planned: 8,
    past: 8,
  },
  src: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp`,
  alt: 'blueberry',
};

export const NeedsManagementPlan = Template.bind({});
NeedsManagementPlan.args = {
  title: 'Blueberry',
  needsPlan: true,
  src: `https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp`,
  alt: 'blueberry',
};
