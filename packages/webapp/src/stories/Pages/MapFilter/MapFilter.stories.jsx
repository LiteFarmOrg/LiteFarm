import React from 'react';
import { componentDecorators } from '../config/Decorators';
import MapDrawer from '../../../components/MapDrawer/';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/MapDrawer',
  decorators: componentDecorators,
  component: MapDrawer,
};

const Template = (args) => <MapDrawer {...args} />;

export const AddToMap = Template.bind({});
AddToMap.args = {
  showMapDrawer: true,
  setShowMapDrawer: () => {},
  onMenuItemClick: () => {},
  headerTitle: 'Add to your map',
};
AddToMap.parameters = {
  ...chromaticSmallScreen,
};

export const Filter = Template.bind({});
Filter.args = {
  showMapDrawer: true,
  setShowMapDrawer: () => {},
  onMenuItemClick: () => {},
  headerTitle: 'Filter your map',
  filterSettings: { map_background: true, label: true, field: true, barn: false },
};
Filter.parameters = {
  ...chromaticSmallScreen,
};
