import React from 'react';
import decorators from '../../config/decorators';
import PureMapFooter from '../../../../components/Map/Footer/';

export default {
  title: 'Components/Map/SpotLight',
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

export const SpotLight = Template.bind({});
SpotLight.args = {
  isAdmin: true,
  showSpotlight: true,
};
SpotLight.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
