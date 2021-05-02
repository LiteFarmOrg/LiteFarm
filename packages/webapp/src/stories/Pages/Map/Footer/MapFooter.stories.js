import React from 'react';
import { componentDecoratorsWithoutPadding } from '../../config/decorators';
import PureMapFooter from '../../../../components/Map/Footer/';
import { locationEnum } from '../../../../containers/Map/constants';

export default {
  title: 'Components/Map/MapFooter',
  component: PureMapFooter,
  decorators: componentDecoratorsWithoutPadding,
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
const Template = (args) => <PureMapFooter {...args} />;

export const Admin = Template.bind({});
Admin.args = {
  isAdmin: true,
  showSpotlight: false,
  availableFilterSettings,
};
Admin.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Worker = Template.bind({});
Worker.args = {
  isAdmin: false,
  showSpotlight: false,
  availableFilterSettings,
};
Worker.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
