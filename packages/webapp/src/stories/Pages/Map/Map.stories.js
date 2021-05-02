import React from 'react';
import decorators from '../config/decorators';
// import PureMap from '../../../components/Map/';
import Map from '../../../containers/Map/';

export default {
  title: 'Page/Map',
  decorators: decorators,
  component: Map,
};

const Template = (args) => <Map />;

export const AdminMap = Template.bind({});
AdminMap.args = {};
AdminMap.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
