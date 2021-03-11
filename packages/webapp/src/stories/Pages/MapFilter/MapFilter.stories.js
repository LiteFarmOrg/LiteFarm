import React from 'react';
import decorators from '../config/decorators';
import MapFilter from '../../../components/MapDrawer/';

export default {
  title: 'Page/MapDrawer',
  decorators: decorators,
  component: MapFilter,
};

const Template = (args) => <MapFilter />;

export const AdminMap = Template.bind({});
AdminMap.args = {};
AdminMap.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
