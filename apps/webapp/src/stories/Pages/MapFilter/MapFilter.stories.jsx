import React from 'react';
import decorators from '../config/Decorators';
import MapDrawer from '../../../components/MapDrawer/';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/MapDrawer',
  decorators: decorators,
  component: MapDrawer,
};

const Template = (args) => <MapDrawer />;

export const AdminMap = Template.bind({});
AdminMap.args = {};
AdminMap.parameters = {
  ...chromaticSmallScreen,
};
