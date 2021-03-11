import React from 'react';
import { componentDecoratorsGreyBackground } from '../../config/decorators';
import MapDrawerMenuItem from '../../../../components/MapDrawer/MapDrawerMenuItem';
import { ReactComponent as MapBackground } from '../../../../assets/images/farmMapFilter/MapBackground.svg';

export default {
  title: 'Components/Map/MapDrawerMenuItem',
  component: MapDrawerMenuItem,
  decorators: componentDecoratorsGreyBackground,
};

const Template = (args) => (
  <MapDrawerMenuItem {...args}>
    <MapBackground />
  </MapDrawerMenuItem>
);

export const FilterInactive = Template.bind({});
FilterInactive.args = {
  name: 'Map background',
  isFilterMenuItem: true,
};

export const FilterActive = Template.bind({});
FilterActive.args = {
  name: 'Map background',
  isFiltered: true,
  isFilterMenuItem: true,
};

export const Add = Template.bind({});
Add.args = {
  name: 'Map background',
};
