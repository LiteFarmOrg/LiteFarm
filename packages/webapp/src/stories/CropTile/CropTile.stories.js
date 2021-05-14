import React from 'react';
import PureCropTile from '../../components/CropTile';
import { componentDecorators } from '../Pages/config/decorators';

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
  src: `crop-images/blueberry.jpg`,
  alt: 'blueberry',
};

export const CropTemplate = Template.bind({});
CropTemplate.args = {
  title: 'Blueberry',
  src: `crop-images/blueberry.jpg`,
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
  src: `crop-images/blueberry.jpg`,
  alt: 'blueberry',
};

export const NeedsManagementPlan = Template.bind({});
NeedsManagementPlan.args = {
  title: 'Blueberry',
  needsPlan: true,
  src: `crop-images/blueberry.jpg`,
  alt: 'blueberry',
};
