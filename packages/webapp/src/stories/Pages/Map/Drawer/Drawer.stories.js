import React from 'react';
import decorators from '../../config/decorators';
import PureMapFooter from '../../../../components/Map/Footer/';

export default {
  title: 'Components/Map/Drawer',
  component: PureMapFooter,
  decorators: decorators,
};

const Template = (args) => (
  <div
    style={{
      display: 'flex',
      flexGrow: 1,
      position: 'absolute',
      flexDirection: 'column',
      width: '100vw',
      height: '100%',
      bottom: 0,
      left: 0,
    }}
  >
    <div style={{ flexGrow: 1 }} />
    <PureMapFooter {...args} />
  </div>
);

export const Filter = Template.bind({});
Filter.args = {
  isAdmin: true,
  showSpotlight: false,
  showMapFilter: true,
  drawerDefaultHeight: window.innerHeight - 156,
};
Filter.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
