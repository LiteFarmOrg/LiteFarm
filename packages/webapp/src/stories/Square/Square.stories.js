import React from 'react';
import { componentDecorators } from '../Pages/config/decorators';
import Square from '../../components/Square';

export default {
  title: 'Components/Square',
  component: Square,
  decorators: componentDecorators,
};

const Template = (args) => <Square {...args} />;
export const Active = Template.bind({});
Active.args = {
  color: 'active',
  children: 8,
};

export const Planned = Template.bind({});
Planned.args = {
  color: 'planned',
  children: 88,
};

export const Past = Template.bind({});
Past.args = {
  color: 'past',
  children: 888,
};

export const CropTileActive = Template.bind({});
CropTileActive.args = {
  color: 'active',
  children: 8,
  isCropTile: true,
};

export const CropTilePlanned = Template.bind({});
CropTilePlanned.args = {
  color: 'planned',
  children: 88,
  isCropTile: true,
};

export const CropTilePast = Template.bind({});
CropTilePast.args = {
  color: 'past',
  children: 888,
  isCropTile: true,
};
