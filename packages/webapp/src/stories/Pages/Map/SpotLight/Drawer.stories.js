import React from 'react';
import decorators from '../../config/decorators';
import PureMapFooter from '../../../../components/Map/Footer/';
import { locationEnum } from '../../../../containers/Map/constants';

export default {
  title: 'Components/Map/SpotLight',
  component: PureMapFooter,
  decorators: decorators,
};
const availableFilterSettings = {
  area: [
    locationEnum.barn,
    locationEnum.ceremonial_area,
    locationEnum.farm_site_boundary,
    locationEnum.field,
    locationEnum.garden,
    locationEnum.greenhouse,
    locationEnum.surface_water,
    locationEnum.natural_area,
    locationEnum.residence,
  ],
  line: [locationEnum.buffer_zone, locationEnum.creek, locationEnum.fence],
  point: [locationEnum.gate, locationEnum.water_valve],
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
  availableFilterSettings,
};
SpotLight.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
