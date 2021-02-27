import React from 'react';
import decorators from '../../config/decorators';
import PureMapFooter from '../../../../components/Map/Footer/';

export default {
  title: 'Components/Map/MapFooter',
  component: PureMapFooter,
};

const Template = (args) => <PureMapFooter {...args} />;

export const Admin = Template.bind({});
Admin.args = {
  isAdmin: true,
  showSpotlight: false,
};
Admin.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Worker = Template.bind({});
Worker.args = {
  isAdmin: false,
  showSpotlight: false,
};
Worker.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
