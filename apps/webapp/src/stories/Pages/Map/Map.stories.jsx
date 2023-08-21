import React from 'react';
import decorators from '../config/Decorators';
// import PureMap from '../../../components/Map/';
import Map from '../../../containers/Map/';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/Map',
  decorators: decorators,
  component: Map,
};

const Template = (args) => <Map {...args} />;

export const AdminMap = Template.bind({});
AdminMap.args = {
  history: { location: {} },
};
AdminMap.parameters = {
  ...chromaticSmallScreen,
};
