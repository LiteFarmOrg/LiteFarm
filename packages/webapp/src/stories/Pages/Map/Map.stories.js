import React from 'react';
import decorators from '../config/decorators';
import PureMap from '../../../components/Map/';

export default {
  title: 'Page/Map',
  decorators: decorators,
  component: PureMap,
};

const Template = (args) => <PureMap {...args} />;

const DEFAULT_CENTER = {
  lat: 49.24966,
  lng: -123.237421,
};

export const AdminMap = Template.bind({});
AdminMap.args = {
  farmName: "Happy Valley",
  isAdmin: true,
  center: DEFAULT_CENTER,
};
AdminMap.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const WorkerMap = Template.bind({});
WorkerMap.args = {
  farmName: "Happy Valley",
  isAdmin: false,
  center: DEFAULT_CENTER,
};
WorkerMap.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
